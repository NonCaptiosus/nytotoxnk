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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    status,
  });
};

// CORS preflight handler
router.options('*', () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    
    return jsonResponse(posts);
  } catch (error) {
    return jsonResponse({ error: 'Failed to fetch posts' }, 500);
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
        return jsonResponse(post);
      }
    }
    
    return jsonResponse({ error: 'Post not found' }, 404);
  } catch (error) {
    return jsonResponse({ error: 'Failed to fetch post' }, 500);
  }
});

// POST create a new blog post
router.post('/api/posts', async (request, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    // Parse request body
    const post = await request.json() as BlogPost;
    
    // Basic validation
    if (!post.title || !post.slug || !post.content) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
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
    
    return jsonResponse(newPost, 201);
  } catch (error) {
    return jsonResponse({ error: 'Failed to create post' }, 500);
  }
});

// PUT update an existing blog post
router.put('/api/posts/:id', async (request, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    const { id } = request.params;
    const updates = await request.json() as Partial<BlogPost>;
    
    // Get existing post
    const existingPost = await env.BLOG_DATA.get(`post:${id}`, 'json') as BlogPost;
    
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
    await env.BLOG_DATA.put(`post:${id}`, JSON.stringify(updatedPost));
    
    return jsonResponse(updatedPost);
  } catch (error) {
    return jsonResponse({ error: 'Failed to update post' }, 500);
  }
});

// DELETE a blog post
router.delete('/api/posts/:id', async (request, env: Env) => {
  try {
    // Check authentication
    if (!authenticateRequest(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    
    const { id } = request.params;
    
    // Check if post exists
    const post = await env.BLOG_DATA.get(`post:${id}`, 'json');
    
    if (!post) {
      return jsonResponse({ error: 'Post not found' }, 404);
    }
    
    // Delete the post
    await env.BLOG_DATA.delete(`post:${id}`);
    
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: 'Failed to delete post' }, 500);
  }
});

// Catch-all route for 404s
router.all('*', () => jsonResponse({ error: 'Not Found' }, 404));

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
}; 