/// <reference types="@cloudflare/workers-types" />
import { Router } from 'itty-router';

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
const authenticateRequest = (request: Request, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  return authHeader === `Bearer ${env.API_SECRET}`;
};

// Helper function to handle JSON responses
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
    status,
  });
};

// CORS preflight handler
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// GET all blog posts
router.get('/api/posts', async (request, env: Env) => {
  try {
    // List all keys with the prefix 'post:'
    const keys = await env.BLOG_DATA.list({ prefix: 'post:' });
    
    // Fetch all posts
    const posts = await Promise.all(
      keys.keys.map(async (key: { name: string }) => {
        const post = await env.BLOG_DATA.get(key.name, 'json') as BlogPost;
        return post;
      })
    );
    
    // Return posts wrapped in the expected format
    return jsonResponse({ posts: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return jsonResponse({ error: 'Failed to fetch posts', posts: [] }, 500);
  }
});

// GET a single blog post by slug
router.get('/api/posts/:slug', async (request, env: Env, context) => {
  try {
    const { slug } = request.params;
    
    // Find the post by slug
    const keys = await env.BLOG_DATA.list({ prefix: 'post:' });
    
    for (const key of keys.keys) {
      const post = await env.BLOG_DATA.get(key.name, 'json') as BlogPost;
      if (post && post.slug === slug) {
        return jsonResponse({ post: post });
      }
    }
    
    return jsonResponse({ error: 'Post not found', post: null }, 404);
  } catch (error) {
    console.error('Error fetching post:', error);
    return jsonResponse({ error: 'Failed to fetch post', post: null }, 500);
  }
});

// POST create a new blog post
router.post('/api/posts', async (request, env: Env) => {
  try {
    console.log('Received POST request to create post');
    
    // Check authentication
    if (!authenticateRequest(request, env)) {
      console.log('Authentication failed');
      return jsonResponse({ error: 'Unauthorized', success: false }, 401);
    }
    
    // Parse request body
    const post = await request.json() as BlogPost;
    
    // Basic validation
    if (!post.title || !post.slug || !post.content) {
      console.log('Missing required fields:', post);
      return jsonResponse({ error: 'Missing required fields', success: false }, 400);
    }
    
    // Create post object with timestamp
    const newPost: BlogPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in KV
    await env.BLOG_DATA.put(`post:${newPost.id}`, JSON.stringify(newPost));
    console.log('Post created successfully:', newPost.id);
    
    // Return in expected format
    return jsonResponse({ 
      post: newPost, 
      success: true,
      message: 'Post created successfully'
    }, 201);
  } catch (error) {
    console.error('Failed to create post:', error);
    return jsonResponse({ 
      error: 'Failed to create post', 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT update an existing blog post
router.put('/api/posts/:id', async (request, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized', success: false }, 401);
    }
    
    const { id } = request.params;
    const updates = await request.json() as Partial<BlogPost>;
    
    // Get existing post
    const existingPost = await env.BLOG_DATA.get(`post:${id}`, 'json') as BlogPost;
    
    if (!existingPost) {
      return jsonResponse({ error: 'Post not found', success: false }, 404);
    }
    
    // Update the post
    const updatedPost: BlogPost = {
      ...existingPost,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Store updated post
    await env.BLOG_DATA.put(`post:${id}`, JSON.stringify(updatedPost));
    
    return jsonResponse({ 
      post: updatedPost,
      success: true,
      message: 'Post updated successfully'
    });
  } catch (error) {
    return jsonResponse({ 
      error: 'Failed to update post', 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// DELETE a blog post
router.delete('/api/posts/:id', async (request, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized', success: false }, 401);
    }
    
    const { id } = request.params;
    
    // Check if post exists
    const post = await env.BLOG_DATA.get(`post:${id}`, 'json');
    
    if (!post) {
      return jsonResponse({ error: 'Post not found', success: false }, 404);
    }
    
    // Delete the post
    await env.BLOG_DATA.delete(`post:${id}`);
    
    return jsonResponse({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    return jsonResponse({ 
      error: 'Failed to delete post', 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Catch-all route for 404s
router.all('*', () => jsonResponse({ error: 'Not Found' }, 404));

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Add basic request logging
      console.log(`${request.method} ${new URL(request.url).pathname}`);
      return router.handle(request, env, ctx);
    } catch (error) {
      console.error('Unhandled error:', error);
      return jsonResponse({ 
        error: 'Internal server error', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  },
}; 