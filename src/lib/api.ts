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

// API response interfaces
interface PostsResponse {
  posts: Post[];
}

interface PostResponse {
  post: Post;
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