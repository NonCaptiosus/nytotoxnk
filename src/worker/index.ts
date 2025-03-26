/// <reference types="@cloudflare/workers-types" />
import { Router } from 'itty-router';

// Define the IRequest type properly
type IRequest = Request & { 
  params: Record<string, string>;
  headers: Headers;
};

// Define post interface
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // For additional fields
}

// Define the environment interface
interface Env {
  BLOG_DATA: KVNamespace;
  API_SECRET: string;
  ENVIRONMENT: string;
}

// Create a new router
const router = Router();

// Helper to check authentication
const authenticateRequest = (request: IRequest, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  console.log('Expected:', `Bearer ${env.API_SECRET}`);
  const isAuthorized = authHeader === `Bearer ${env.API_SECRET}`;
  console.log('Auth result:', isAuthorized ? 'Authorized' : 'Unauthorized');
  return isAuthorized;
};

// Helper to get headers as an object
const getHeadersAsObject = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Helper function to handle JSON responses
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    status,
  });
};

// CORS preflight handler - this must be the first route
router.options('*', () => {
  console.log('Handling OPTIONS preflight request');
  return new Response(null, {
    status: 204, // No content status
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Home route to check if the worker is running correctly
router.get('/', () => {
  return new Response('Blog API is running', {
    headers: { 'Content-Type': 'text/plain' },
  });
});

// GET all blog posts
router.get('/api/posts', async (request: IRequest, env: Env) => {
  try {
    console.log('GET /api/posts request received');
    // List all keys with the prefix 'post:'
    const keys = await env.BLOG_DATA.list({ prefix: 'post:' });
    
    // If there are no posts, return an empty array
    if (!keys || !keys.keys || keys.keys.length === 0) {
      return jsonResponse([]);
    }
    
    // Fetch all posts
    const postsPromises = keys.keys.map(async (key: { name: string }) => {
      try {
        const post = await env.BLOG_DATA.get(key.name, 'json') as BlogPost;
        return post;
      } catch (err) {
        console.error(`Error fetching post with key ${key.name}:`, err);
        return null;
      }
    });
    
    const posts = await Promise.all(postsPromises);
    
    // Filter out any null values (failed fetches)
    const validPosts = posts.filter(post => post !== null);
    
    return jsonResponse(validPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return jsonResponse({ error: 'Failed to fetch posts' }, 500);
  }
});

// GET a single blog post by slug
router.get('/api/posts/:slug', async (request: IRequest, env: Env) => {
  try {
    const { slug } = request.params;
    console.log(`GET /api/posts/${slug} request received`);
    
    // Find the post by slug
    const keys = await env.BLOG_DATA.list({ prefix: 'post:' });
    
    // If there are no posts, return 404
    if (!keys || !keys.keys || keys.keys.length === 0) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }
    
    for (const key of keys.keys) {
      try {
        const post = await env.BLOG_DATA.get(key.name, 'json') as BlogPost;
        if (post && post.slug === slug) {
          return jsonResponse(post);
        }
      } catch (err) {
        console.error(`Error fetching post with key ${key.name}:`, err);
        continue; // Try the next post
      }
    }
    
    return jsonResponse({ error: 'Post not found' }, 404);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return jsonResponse({ error: 'Failed to fetch post' }, 500);
  }
});

// POST create a new blog post
router.post('/api/posts', async (request: IRequest, env: Env) => {
  try {
    console.log('POST /api/posts request received');
    
    // Check authentication
    if (!authenticateRequest(request, env)) {
      console.log('Authentication failed');
      // Log headers for debugging
      console.log('Headers:', JSON.stringify(getHeadersAsObject(request.headers)));
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    // Parse request body
    let post;
    try {
      const reqClone = request.clone();
      post = await reqClone.json() as BlogPost;
      console.log('Received post data:', { title: post.title, slug: post.slug, contentLength: post.content?.length || 0 });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    // Basic validation
    if (!post.title || !post.slug || !post.content) {
      const missingFields = [];
      if (!post.title) missingFields.push('title');
      if (!post.slug) missingFields.push('slug');
      if (!post.content) missingFields.push('content');
      
      console.log('Missing required fields:', missingFields);
      return jsonResponse({ error: `Missing required fields: ${missingFields.join(', ')}` }, 400);
    }
    
    // Create post object with timestamp
    const newPost: BlogPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in KV
    try {
      await env.BLOG_DATA.put(`post:${newPost.id}`, JSON.stringify(newPost));
      console.log('Post stored successfully with ID:', newPost.id);
    } catch (kvError) {
      console.error('Error storing post in KV:', kvError);
      return jsonResponse({ error: 'Failed to store post in database' }, 500);
    }
    
    return jsonResponse(newPost, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return jsonResponse({ error: 'Failed to create post: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500);
  }
});

// PUT update an existing blog post
router.put('/api/posts/:id', async (request: IRequest, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    const { id } = request.params;
    
    // Parse request body
    let updates;
    try {
      updates = await request.json() as Partial<BlogPost>;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    // Get existing post
    let existingPost;
    try {
      existingPost = await env.BLOG_DATA.get(`post:${id}`, 'json') as BlogPost;
    } catch (error) {
      console.error(`Error fetching post with id ${id}:`, error);
      return jsonResponse({ error: 'Error retrieving post from database' }, 500);
    }
    
    if (!existingPost) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }
    
    // Update the post
    const updatedPost: BlogPost = {
      ...existingPost,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Store updated post
    try {
      await env.BLOG_DATA.put(`post:${id}`, JSON.stringify(updatedPost));
    } catch (error) {
      console.error('Error updating post in KV:', error);
      return jsonResponse({ error: 'Failed to update post in database' }, 500);
    }
    
    return jsonResponse(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return jsonResponse({ error: 'Failed to update post' }, 500);
  }
});

// DELETE a blog post
router.delete('/api/posts/:id', async (request: IRequest, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    const { id } = request.params;
    
    // Check if post exists
    let post;
    try {
      post = await env.BLOG_DATA.get(`post:${id}`, 'json');
    } catch (error) {
      console.error(`Error fetching post with id ${id}:`, error);
      return jsonResponse({ error: 'Error retrieving post from database' }, 500);
    }
    
    if (!post) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }
    
    // Delete the post
    try {
      await env.BLOG_DATA.delete(`post:${id}`);
    } catch (error) {
      console.error('Error deleting post from KV:', error);
      return jsonResponse({ error: 'Failed to delete post from database' }, 500);
    }
    
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return jsonResponse({ error: 'Failed to delete post' }, 500);
  }
});

// Catch-all route for 404s
router.all('*', () => {
  console.log('Route not found');
  return jsonResponse({ error: 'Not Found' }, 404);
});

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      console.log(`${request.method} ${new URL(request.url).pathname} request received`);
      
      // Log helpful debug info
      if (request.method === 'POST') {
        console.log('Headers:', JSON.stringify(getHeadersAsObject(request.headers)));
      }
      
      // Handle the request with the router
      return router.handle(request, env, ctx);
    } catch (error) {
      console.error('Unhandled error in fetch handler:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  },
}; 