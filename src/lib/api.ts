// This file provides utilities for interacting with the Cloudflare Worker API

// Use a simpler token for local development
const API_TOKEN = '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55';

// Get the base URL for API requests
const getBaseUrl = () => {
  return 'https://web-bot.aldodiku.workers.dev';
};

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
  id?: string;
  title: string;
  slug: string;
  content: string;
  author?: string;
  tags?: string[];
  created?: number;  // timestamp
  updated?: number;  // timestamp
  createdAt?: string; // keep for backward compatibility
  updatedAt?: string; // keep for backward compatibility
}

// Error response interface
interface ErrorResponse {
  error?: string;
  details?: string;
  [key: string]: any;
}

interface CreatePostResponse {
  post: Post;
  success: boolean;
  message: string;
}

/**
 * Fetch all blog posts
 */
export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent long-hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as Post[];
    return data || [];
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
    // Find a fallback post if it exists for this slug
    const fallbackPost = FALLBACK_POSTS.find(post => post.slug === slug);
    
    const response = await fetch(`${getBaseUrl()}/api/blog/${slug}`, {
      method: 'GET',
      headers: {
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

    const data = await response.json() as Post;
    return data || null;
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
export async function createPost(post: Post): Promise<CreatePostResponse> {
  try {
    console.log('Creating post via Cloudflare Worker API');
    
    // Current blog post properties needed by the worker
    const processedPost = {
      title: post.title,
      slug: post.slug,
      content: post.content.slice(0, 100000), // Hard limit on content length
      author: post.author || 'Anonymous',
      tags: post.tags || []
    };

    console.log('Post data being sent:', {
      title: processedPost.title,
      slug: processedPost.slug,
      contentLength: processedPost.content.length
    });
    
    const response = await fetch(`${getBaseUrl()}/api/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedPost),
      cache: 'no-cache',
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      
      try {
        // Try to parse the error as JSON
        const errorData = await response.json() as ErrorResponse;
        if (errorData && typeof errorData === 'object') {
          if (errorData.error) {
            errorMessage = `API error: ${errorData.error}`;
          }
          if (errorData.details) {
            errorMessage += ` - ${errorData.details}`;
          }
        }
      } catch (jsonError) {
        // If JSON parsing fails, try to get the error as text
        try {
          const errorText = await response.text();
          if (errorText && errorText.length > 100) {
            errorMessage = `API error: ${response.status} - ${errorText.substring(0, 100)}...`;
          } else if (errorText) {
            errorMessage = `API error: ${response.status} - ${errorText}`;
          }
        } catch (textError) {
          // If text parsing also fails, use the status code
          console.error('Failed to parse error response:', textError);
        }
      }
      
      // Add specific error handling for common status codes
      if (response.status === 401) {
        errorMessage = 'API error: Authentication failed. Please check your credentials.';
      } else if (response.status === 413) {
        errorMessage = 'API error: Post content is too large. Please reduce the size of your post.';
      } else if (response.status === 429) {
        errorMessage = 'API error: Too many requests. Please try again later.';
      } else if (response.status >= 500) {
        errorMessage = 'API error: Server encountered an error. The service might be temporarily unavailable.';
      }
      
      console.error('API error response:', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json() as Post;
      console.log('Post created successfully with ID:', data.id);
      return {
        post: data,
        success: true,
        message: 'Post created successfully'
      };
    } catch (parseError) {
      console.error('Error parsing successful response:', parseError);
      throw new Error('API error: Failed to parse server response');
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Connection error - unable to reach API server');
      throw new Error('Failed to fetch: Unable to connect to the server');
    } else {
      console.error('Error creating post:', error);
      
      // Return development mode success for local testing
      if (process.env.NODE_ENV === 'development') {
        const mockPost: Post = {
          id: 'local-' + Date.now(),
          title: post.title,
          slug: post.slug,
          content: post.content,
          author: post.author,
          tags: post.tags,
          created: Date.now()
        };
        
        return {
          post: mockPost,
          success: true,
          message: '[DEV MODE] Post created successfully (simulated)'
        };
      }
      
      throw error;
    }
  }
} 