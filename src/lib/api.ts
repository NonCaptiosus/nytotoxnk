// This file provides utilities for interacting with the Cloudflare Worker API

// Base API URL - in production this would point to your Cloudflare Workers domain
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://blog-api.aldodiku.workers.dev' 
  : 'http://localhost:8787';

// API token for authentication (would be stored securely in environment variables)
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55'; 

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
    const response = await fetch(`${API_URL}/api/posts`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as PostsResponse;
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_URL}/api/posts/${slug}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as PostResponse;
    return data.post || null;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
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
      },
      body: JSON.stringify(newPost),
    });

    const data = await response.json() as CreatePostResponse;
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
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 