// This file provides utilities for interacting with the Cloudflare Worker API
import { postsCache } from './postsCache';

// Use a simpler token for local development
const API_TOKEN = '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55';

// Get the base URL for API requests
export const getBaseUrl = () => {
  // Support for both production and development environments
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://127.0.0.1:8787';
  }
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
    author: 'Admin',
    tags: ['Next.js', 'React', 'Web Development']
  },
  {
    id: 'fallback-2',
    title: 'Cloudflare Workers for Beginners',
    slug: 'cloudflare-workers-for-beginners',
    content: 'Cloudflare Workers allows you to run serverless JavaScript at the edge. This tutorial walks through deploying your first Worker and explains key concepts for building highly available APIs.',
    createdAt: new Date().toISOString(),
    author: 'Admin',
    tags: ['Cloudflare', 'Serverless', 'Edge Computing']
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
  // Try to get posts from cache first
  const cachedPosts = postsCache.getPosts();
  if (cachedPosts) {
    return cachedPosts;
  }
  
  try {
    const response = await fetch(`${getBaseUrl()}/api/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as Post[];
    
    // Ensure data is an array and all items are valid posts
    if (!Array.isArray(data)) {
      console.error('API did not return an array of posts:', data);
      return FALLBACK_POSTS;
    }
    
    // Filter out any invalid posts and ensure all properties are normalized
    const validPosts = data.filter(post => post && typeof post === 'object' && post.title && post.slug)
      .map(post => ({
        ...post,
        id: post.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: post.content || '',
        author: post.author || 'Anonymous',
        tags: Array.isArray(post.tags) ? post.tags : []
      }));
    
    const posts = validPosts.length > 0 ? validPosts : FALLBACK_POSTS;
    
    // Save posts to cache
    postsCache.setPosts(posts);
    
    return posts;
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
  // Try to get post from cache first
  const cachedPost = postsCache.getPostBySlug(slug);
  if (cachedPost) {
    return cachedPost;
  }
  
  try {
    // Find a fallback post if it exists for this slug
    const fallbackPost = FALLBACK_POSTS.find(post => post.slug === slug);
    
    // Try to get all posts first (to populate cache) if cache is empty
    const cachedPosts = postsCache.getPosts();
    if (!cachedPosts) {
      // This will populate the cache with all posts
      const allPosts = await fetchPosts();
      
      // Check if we now have the post in the cache
      const newlyCachedPost = postsCache.getPostBySlug(slug);
      if (newlyCachedPost) {
        return newlyCachedPost;
      }
    }
    
    // If still not in cache, fetch directly by slug
    const response = await fetch(`${getBaseUrl()}/api/blog/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const data = await response.json();
    
    console.log('Raw API response for post:', data); // Debug the raw response
    
    // Ensure the post has valid structure and normalize all properties
    if (!data || typeof data !== 'object') {
      console.error(`Invalid post data received for slug ${slug}:`, data);
      return fallbackPost || null;
    }
    
    // Type assertion after basic validation
    const dataObj = data as Record<string, any>;
    
    if (!dataObj.title || !dataObj.slug) {
      console.error(`Post data missing required fields for slug ${slug}:`, data);
      return fallbackPost || null;
    }
    
    // Make sure content is always a string, defaulting to empty string if not present
    const postContent = dataObj.content !== undefined ? String(dataObj.content) : '';
    
    // Normalize the post data
    const post: Post = {
      id: dataObj.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: String(dataObj.title),
      slug: String(dataObj.slug),
      content: postContent,
      author: dataObj.author ? String(dataObj.author) : 'Anonymous',
      tags: Array.isArray(dataObj.tags) ? dataObj.tags : []
    };
    
    console.log('Normalized post with content:', post); // Debug the processed post
    
    // Update the cache with this post
    // We'll get all posts, add/update this one, and save back to cache
    const posts = postsCache.getPosts() || [];
    const postIndex = posts.findIndex(p => p.slug === slug);
    
    if (postIndex >= 0) {
      // Update existing post
      posts[postIndex] = post;
    } else {
      // Add new post
      posts.push(post);
    }
    
    postsCache.setPosts(posts);
    
    return post;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    // Return fallback post if available for this slug
    return FALLBACK_POSTS.find(post => post.slug === slug) || null;
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

    // Parse the successful response
    const result = await response.json() as CreatePostResponse;
    console.log('Post created successfully:', result);
    
    // Clear the posts cache after creating a new post
    if (typeof window !== 'undefined') {
      try {
        // Clear the cache to ensure we fetch fresh data next time
        postsCache.clearCache();
      } catch (error) {
        console.error('Error clearing cache after post creation:', error);
      }
    }
    
    return result;
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

/**
 * Update a blog post by slug
 */
export async function updatePost(slug: string, post: Post): Promise<Post | null> {
  try {
    console.log(`Updating post with slug ${slug}`);
    
    // Process the post data
    const processedPost = {
      title: post.title,
      slug: post.slug,
      content: post.content,
      author: post.author || 'Anonymous',
      tags: post.tags || []
    };

    const response = await fetch(`${getBaseUrl()}/api/blog/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedPost),
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.error(`API error when updating post: ${response.status}`);
      throw new Error(`Failed to update post: ${response.status}`);
    }

    const updatedPost = await response.json() as Post;
    
    // Update the post in the cache
    const cachedPosts = postsCache.getPosts();
    if (cachedPosts) {
      const postIndex = cachedPosts.findIndex(p => p.slug === slug);
      if (postIndex >= 0) {
        cachedPosts[postIndex] = updatedPost;
        postsCache.setPosts(cachedPosts);
      }
    }
    
    return updatedPost;
  } catch (error) {
    console.error(`Error updating post with slug ${slug}:`, error);
    
    // For development mode, simulate successful update
    if (process.env.NODE_ENV === 'development') {
      const mockUpdatedPost: Post = {
        ...post,
        updated: Date.now()
      };
      return mockUpdatedPost;
    }
    
    throw error;
  }
}

/**
 * Delete a blog post by slug
 */
export async function deletePost(slug: string): Promise<boolean> {
  try {
    console.log(`Deleting post with slug ${slug}`);
    
    const response = await fetch(`${getBaseUrl()}/api/blog/${slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.error(`API error when deleting post: ${response.status}`);
      throw new Error(`Failed to delete post: ${response.status}`);
    }

    // Remove the post from cache
    const cachedPosts = postsCache.getPosts();
    if (cachedPosts) {
      const filteredPosts = cachedPosts.filter(p => p.slug !== slug);
      postsCache.setPosts(filteredPosts);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting post with slug ${slug}:`, error);
    
    // For development mode, simulate successful deletion
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    throw error;
  }
}

/**
 * Update a project by slug
 */
export async function updateProject(slug: string, project: any): Promise<any | null> {
  try {
    console.log(`Updating project with slug ${slug}`);
    
    const response = await fetch(`${getBaseUrl()}/api/projects/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.error(`API error when updating project: ${response.status}`);
      throw new Error(`Failed to update project: ${response.status}`);
    }

    const updatedProject = await response.json();
    return updatedProject;
  } catch (error) {
    console.error(`Error updating project with slug ${slug}:`, error);
    
    // For development mode, simulate successful update
    if (process.env.NODE_ENV === 'development') {
      return {
        ...project,
        updated: Date.now()
      };
    }
    
    throw error;
  }
}

/**
 * Delete a project by slug
 */
export async function deleteProject(slug: string): Promise<boolean> {
  try {
    console.log(`Deleting project with slug ${slug}`);
    
    const response = await fetch(`${getBaseUrl()}/api/projects/${slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.error(`API error when deleting project: ${response.status}`);
      throw new Error(`Failed to delete project: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting project with slug ${slug}:`, error);
    
    // For development mode, simulate successful deletion
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    throw error;
  }
} 