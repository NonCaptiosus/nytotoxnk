// This file provides utilities for interacting with the Cloudflare Worker API

// Base API URL - in production this would point to your Cloudflare Workers domain
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://blog-api.aldodiku.workers.dev' 
  : 'http://localhost:8787';

// API token for authentication (would be stored securely in environment variables)
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55'; 

// Mock data for fallback when API is unavailable
const FALLBACK_POSTS = [
  {
    id: 'fallback-1',
    title: 'Getting Started with Next.js',
    slug: 'getting-started-with-nextjs',
    content: 'Next.js is a powerful React framework that makes building web applications simple and efficient. This post explores the basics of getting started with Next.js and its key features like server-side rendering, static site generation, and API routes.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    title: 'Cloudflare Workers for Beginners',
    slug: 'cloudflare-workers-for-beginners',
    content: 'Cloudflare Workers allows you to run serverless JavaScript at the edge. This tutorial walks through deploying your first Worker and explains key concepts for building highly available APIs.',
    createdAt: new Date().toISOString(),
  }
];

// Post interface
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// New post interface for creation
export interface NewPost {
  title: string;
  slug: string;
  content: string;
}

// API response interfaces
interface PostsResponse {
  posts: Post[];
}

interface PostResponse {
  post: Post;
}

interface CreatePostResponse {
  post: Post;
  success: boolean;
  message?: string;
}

/**
 * Fetch all blog posts
 */
export async function fetchPosts(): Promise<Post[]> {
  try {
    console.log('Fetching posts from API:', `${API_URL}/api/posts`);
    
    const response = await fetch(`${API_URL}/api/posts`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent long-hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as PostsResponse;
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Return fallback posts when API fails
    console.log('Using fallback posts due to API error');
    return FALLBACK_POSTS;
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    console.log(`Fetching post with slug ${slug} from API`);
    
    // Check if slug matches a fallback post first
    const fallbackPost = FALLBACK_POSTS.find(post => post.slug === slug);
    
    const response = await fetch(`${API_URL}/api/posts/${slug}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent long-hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`API returned status for slug ${slug}: ${response.status}`);
      // If we have a fallback post with this slug, return it
      if (fallbackPost) {
        console.log(`Using fallback post for slug ${slug}`);
        return fallbackPost;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as PostResponse;
    return data.post || null;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    
    // Return fallback post if exists
    const fallbackPost = FALLBACK_POSTS.find(post => post.slug === slug);
    if (fallbackPost) {
      console.log(`Using fallback post for slug ${slug} due to API error`);
      return fallbackPost;
    }
    
    return null;
  }
}

/**
 * Create a new blog post
 */
export async function createPost(newPost: NewPost): Promise<{success: boolean; message: string; post?: Post}> {
  console.log('Sending post to API:', newPost);
  
  try {
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        // Add these headers to help with CORS
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(newPost),
      // Add timeout
      signal: AbortSignal.timeout(8000),
    });

    // Handle different status codes
    if (response.status === 204) {
      // No content but success
      return {
        success: true,
        message: 'Post created successfully (no content returned)',
      };
    }

    // For other responses, try to parse JSON
    let data: CreatePostResponse;
    try {
      data = await response.json() as CreatePostResponse;
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      return {
        success: false,
        message: `Error parsing API response: ${response.status}`,
      };
    }
    
    console.log('API response:', data);
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `API error: ${response.status}`,
      };
    }

    return {
      success: true,
      message: 'Post created successfully',
      post: data.post,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    
    // For debugging only, simulate success in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('DEV MODE: Simulating post creation success');
      const mockPost: Post = {
        id: `local-${Date.now()}`,
        title: newPost.title,
        slug: newPost.slug,
        content: newPost.content,
        createdAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        message: '(DEV MODE) Post created successfully in mock mode',
        post: mockPost,
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 