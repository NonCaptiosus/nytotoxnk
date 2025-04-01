// This file provides utilities for interacting with the Cloudflare Worker API
import { postsCache } from './postsCache';

// Use a simpler token for local development
const API_TOKEN = '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55';

// Get the base URL for API requests
export const getBaseUrl = () => {
  // Check if the environment is a Cloudflare environment
  if (typeof process !== 'undefined' && process.env.CF_PAGES) {
    console.log('Running in Cloudflare Pages environment');
    return ''; // Use relative URLs in Cloudflare environment
  }

  // Try these endpoints in sequence to see which one works:
  // 1. The direct production environment
  return 'https://web-bot.aldodiku.workers.dev';
  
  // Disabled for testing:
  // if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  //   return 'http://127.0.0.1:8787';
  // }
  // return 'https://web-bot.aldodiku.workers.dev';
};

// Alternative URLs to try for content specifically
const CONTENT_ENDPOINTS = [
  'https://web-bot.aldodiku.workers.dev/api/blog', // Standard API
  'https://web-bot.aldodiku.workers.dev/api/kv/blogs', // KV-specific endpoint
  'https://web-bot.aldodiku.workers.dev/v1/blogs', // Version-specific endpoint
  'https://blog-api.aldodiku.workers.dev/api/blog', // Alternative domain
];

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
 * Try to fetch content from multiple possible endpoints
 */
async function tryFetchContent(slug: string): Promise<string> {
  // Try each endpoint in sequence
  for (const baseEndpoint of CONTENT_ENDPOINTS) {
    try {
      const endpoint = `${baseEndpoint}/${slug}`;
      console.log(`Trying to fetch content from: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
      });
      
      if (response.ok) {
        // Try to parse as JSON first
        const text = await response.text();
        
        // If successful and not empty, return the content
        if (text && text.trim().length > 0) {
          console.log(`Successful content fetch from ${endpoint} (length: ${text.length})`);
          
          // Try to parse as JSON to extract content field if possible
          try {
            const json = JSON.parse(text);
            if (json && typeof json === 'object') {
              // Check if there's a content field
              if (json.content && typeof json.content === 'string' && json.content.trim().length > 0) {
                console.log('Found content field in JSON response');
                return json.content;
              }
              
              // Check if there's a post field with content
              if (json.post && typeof json.post === 'object' && json.post.content && 
                  typeof json.post.content === 'string' && json.post.content.trim().length > 0) {
                console.log('Found content field in post object');
                return json.post.content;
              }
            }
          } catch (jsonError) {
            // If it's not JSON, assume it's the raw content
            console.log('Response is not JSON, using as raw content');
          }
          
          return text;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${baseEndpoint}/${slug}:`, error);
    }
  }
  
  // If all endpoints fail, return empty string
  return '';
}

/**
 * Fetch all blog posts
 */
export async function fetchPosts(): Promise<Post[]> {
  // Try to get posts from cache first
  const cachedPosts = postsCache.getPosts();
  if (cachedPosts) {
    console.log(`Using ${cachedPosts.length} cached posts`);
    return cachedPosts;
  }
  
  try {
    console.log('Fetching all posts with content from API');
    const response = await fetch(`${getBaseUrl()}/api/blog/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure we don't use a cached response
    });

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    // Get the raw response text for debugging
    const responseText = await response.text();
    console.log('Raw API response text for posts:', responseText.substring(0, 500) + '...');
    
    // Parse the JSON ourselves
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Successfully parsed posts data, type:', typeof data);
      
      if (Array.isArray(data)) {
        console.log(`Parsed ${data.length} posts from array`);
      } else if (data && typeof data === 'object') {
        console.log('Parsed response object with keys:', Object.keys(data));
        
        // Check if posts are in a nested field like 'posts' or 'items'
        for (const key of ['posts', 'items', 'data', 'results', 'blogs']) {
          if (data[key] && Array.isArray(data[key])) {
            console.log(`Found posts array in field '${key}' with ${data[key].length} items`);
            data = data[key];
            break;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return FALLBACK_POSTS;
    }
    
    // Ensure data is an array and all items are valid posts
    if (!Array.isArray(data)) {
      console.error('API did not return a proper array of posts:', data);
      return FALLBACK_POSTS;
    }
    
    console.log(`Processing ${data.length} posts from API response`);
    
    // Filter out any invalid posts and ensure all properties are normalized
    const validPosts = data.filter(post => post && typeof post === 'object')
      .map(post => {
        // Extract post data, either directly or from a nested 'post' field
        const postData = post.post && typeof post.post === 'object' ? post.post : post;
        
        // Log the structure of a post to help debug
        if (postData) {
          console.log('Post data keys:', Object.keys(postData));
          console.log('Post has direct content field:', postData.content !== undefined);
          
          if (postData.content) {
            console.log('Content type:', typeof postData.content);
          }
        }
        
        // Ensure required fields are present
        if (!postData || !postData.title || !postData.slug) {
          console.warn('Skipping invalid post without title or slug');
          return null;
        }
        
        // Extract content from various possible locations
        let content = '';
        
        // Check direct content
        if (postData.content !== undefined && postData.content !== null) {
          if (typeof postData.content === 'string') {
            content = postData.content;
          } else if (typeof postData.content === 'object') {
            try {
              content = JSON.stringify(postData.content);
            } catch (e) {
              console.error('Failed to stringify content object:', e);
            }
          } else {
            content = String(postData.content);
          }
        } 
        // If no direct content, look for other fields that might contain content
        else {
          for (const key in postData) {
            if (
              (key.toLowerCase().includes('content') || key.toLowerCase().includes('body') || key.toLowerCase().includes('text')) && 
              key !== 'title' && // Skip title field
              postData[key] !== undefined && 
              postData[key] !== null
            ) {
              console.log(`Found potential content in field ${key}`);
              if (typeof postData[key] === 'string') {
                content = postData[key];
                break;
              } else if (typeof postData[key] === 'object') {
                try {
                  content = JSON.stringify(postData[key]);
                  break;
                } catch (e) {
                  console.error(`Failed to stringify content object in ${key}:`, e);
                }
              } else {
                content = String(postData[key]);
                break;
              }
            }
          }
        }
        
        return {
          id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: String(postData.title),
          slug: String(postData.slug),
          content: content,
          author: postData.author || 'Anonymous',
          tags: Array.isArray(postData.tags) ? postData.tags : [],
          created: postData.created || postData.timestamp || null,
          createdAt: postData.createdAt || null
        } as Post;
      })
      .filter((post): post is Post => post !== null); // Type guard to filter out nulls and ensure Post[] type
    
    console.log(`Normalized ${validPosts.length} valid posts`);
    
    // Check if we have valid content in posts
    const postsWithContent = validPosts.filter(post => post && post.content && post.content.length > 0);
    console.log(`${postsWithContent.length} posts have content out of ${validPosts.length} total posts`);
    
    // Log a sample post to debug
    if (validPosts.length > 0) {
      const samplePost = validPosts[0];
      if (samplePost) {
        console.log('Sample post:', {
          title: samplePost.title,
          slug: samplePost.slug,
          contentLength: samplePost.content?.length || 0,
          contentPreview: samplePost.content ? samplePost.content.substring(0, 50) + '...' : 'none'
        });
      }
    }
    
    const posts = validPosts.length > 0 ? validPosts : FALLBACK_POSTS;
    
    // Try to fetch content for posts that are missing it
    if (validPosts.length > 0) {
      const postsWithoutContent = validPosts.filter(post => !post.content || post.content.length === 0);
      
      if (postsWithoutContent.length > 0) {
        console.log(`Attempting to fetch content for ${postsWithoutContent.length} posts from KV store`);
        
        // Fetch content for each post in parallel
        const contentPromises = postsWithoutContent.map(async (post) => {
          try {
            const content = await tryFetchContent(post.slug);
            if (content && content.trim().length > 0) {
              console.log(`Retrieved content for ${post.slug} from KV store (length: ${content.length})`);
              // Update the post with the content
              post.content = content;
              return true;
            }
          } catch (error) {
            console.warn(`Failed to fetch content for ${post.slug} from KV:`, error);
          }
          return false;
        });
        
        // Wait for all content fetches to complete
        const results = await Promise.all(contentPromises);
        const successCount = results.filter(Boolean).length;
        console.log(`Successfully fetched content for ${successCount} posts from KV store`);
      }
    }
    
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
    console.log(`Using cached post for slug ${slug} with content length: ${cachedPost.content?.length || 0}`);
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
        console.log(`Found post in newly populated cache for ${slug} with content length: ${newlyCachedPost.content?.length || 0}`);
        return newlyCachedPost;
      }
    }
    
    // If still not in cache, fetch directly by slug
    console.log(`Fetching post directly by slug: ${slug}`);
    
    // SPECIAL CASE: Try to get the content directly from KV store
    let kvContent = '';
    try {
      console.log('Attempting to fetch content directly from KV format');
      const contentResponse = await fetch(`${getBaseUrl()}/api/kv/blogs/${slug}`, {
        method: 'GET',
        cache: 'no-store',
      });
      
      if (contentResponse.ok) {
        kvContent = await contentResponse.text();
        console.log(`KV content response for ${slug} (length ${kvContent.length}):`);
        if (kvContent.length > 0) {
          console.log(kvContent.substring(0, 100) + '...');
        }
      }
    } catch (kvError) {
      console.warn('Failed to fetch from KV format:', kvError);
    }
    
    // Standard API fetch
    const response = await fetch(`${getBaseUrl()}/api/blog/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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

    // Get the raw response text for debugging
    const responseText = await response.text();
    console.log('Raw API response text for post:', responseText.substring(0, 500) + '...');
    
    // Parse the JSON ourselves
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Successfully parsed post data with keys:', Object.keys(data));
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return fallbackPost || null;
    }
    
    // Debug the full structure deeply
    console.log('Full data structure:', JSON.stringify(data, null, 2).substring(0, 1000) + '...');
    
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
    
    // Debug log for content field
    console.log(`Content field exists: ${dataObj.content !== undefined}`);
    console.log(`Content field type: ${typeof dataObj.content}`);
    console.log(`Content field nested inside post: ${dataObj.post?.content !== undefined}`);
    console.log(`Post field exists: ${dataObj.post !== undefined}`);
    
    if (dataObj.post && typeof dataObj.post === 'object') {
      console.log('Post object keys:', Object.keys(dataObj.post));
      
      if (dataObj.post.content) {
        console.log('Content found inside post object');
      }
    }
    
    // If we have content from the KV store, use it instead of looking for content in the response
    let postContent = '';
    
    if (kvContent && kvContent.trim().length > 0) {
      console.log('Using content from KV store');
      postContent = kvContent;
    } else {
      // Check for the content in both possible locations (directly or in post object)
      
      // Check if the content is directly in the response
      if (dataObj.content !== undefined && dataObj.content !== null) {
        console.log('Found content directly in the response object');
        if (typeof dataObj.content === 'string') {
          postContent = dataObj.content;
        } else if (typeof dataObj.content === 'object') {
          // Try to stringify object content
          try {
            postContent = JSON.stringify(dataObj.content);
          } catch (e) {
            console.error('Failed to stringify content object:', e);
          }
        } else {
          postContent = String(dataObj.content);
        }
      } 
      // Check if the content is inside a 'post' field
      else if (dataObj.post && typeof dataObj.post === 'object' && dataObj.post.content) {
        console.log('Found content inside post object');
        if (typeof dataObj.post.content === 'string') {
          postContent = dataObj.post.content;
        } else if (typeof dataObj.post.content === 'object') {
          try {
            postContent = JSON.stringify(dataObj.post.content);
          } catch (e) {
            console.error('Failed to stringify content object inside post:', e);
          }
        } else {
          postContent = String(dataObj.post.content);
        }
      }
      // If still no content, check all fields for a content-like field
      else {
        console.log('Searching for content in all fields');
        // Check all top-level fields for content-like field
        for (const key in dataObj) {
          if (
            (key.toLowerCase().includes('content') || key.toLowerCase().includes('body') || key.toLowerCase().includes('text')) && 
            dataObj[key] !== undefined && 
            dataObj[key] !== null
          ) {
            console.log(`Found potential content in field ${key}`);
            if (typeof dataObj[key] === 'string') {
              postContent = dataObj[key];
              break;
            } else if (typeof dataObj[key] === 'object') {
              try {
                postContent = JSON.stringify(dataObj[key]);
                break;
              } catch (e) {
                console.error(`Failed to stringify content object in ${key}:`, e);
              }
            } else {
              postContent = String(dataObj[key]);
              break;
            }
          }
        }
        
        // If still no content, try fields inside 'post' if it exists
        if (!postContent && dataObj.post && typeof dataObj.post === 'object') {
          for (const key in dataObj.post) {
            if (
              (key.toLowerCase().includes('content') || key.toLowerCase().includes('body') || key.toLowerCase().includes('text')) && 
              dataObj.post[key] !== undefined && 
              dataObj.post[key] !== null
            ) {
              console.log(`Found potential content in post.${key}`);
              if (typeof dataObj.post[key] === 'string') {
                postContent = dataObj.post[key];
                break;
              } else if (typeof dataObj.post[key] === 'object') {
                try {
                  postContent = JSON.stringify(dataObj.post[key]);
                  break;
                } catch (e) {
                  console.error(`Failed to stringify content object in post.${key}:`, e);
                }
              } else {
                postContent = String(dataObj.post[key]);
                break;
              }
            }
          }
        }
      }
    }
    
    console.log(`Final content length: ${postContent.length}`);
    if (postContent.length > 0) {
      console.log(`Content preview: ${postContent.substring(0, 100)}...`);
    } else {
      console.warn('No content found in the response!');
    }
    
    // Use either the directly returned post or create one from the data
    const post: Post = dataObj.post && typeof dataObj.post === 'object' ? {
      ...dataObj.post,
      id: dataObj.post.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: postContent || dataObj.post.content || '',
      author: dataObj.post.author || 'Anonymous',
      tags: Array.isArray(dataObj.post.tags) ? dataObj.post.tags : []
    } : {
      id: dataObj.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: String(dataObj.title),
      slug: String(dataObj.slug),
      content: postContent,
      author: dataObj.author ? String(dataObj.author) : 'Anonymous',
      tags: Array.isArray(dataObj.tags) ? dataObj.tags : []
    };
    
    console.log('Normalized post:', {
      id: post.id,
      title: post.title,
      slug: post.slug,
      contentLength: post.content?.length || 0,
      author: post.author,
      tagsCount: post.tags?.length || 0
    });
    
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
  const url = `${getBaseUrl()}/api/blog`;
  console.log('Creating post at:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(post),
      cache: 'no-store', // Ensure no caching for POST requests
    });

    // Handle non-OK response
    if (!response.ok) {
      let errorData: ErrorResponse = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.warn('Could not parse error response JSON');
        errorData.error = `Request failed with status ${response.status}`;
      }
      console.error('Error creating post:', errorData);
      return {
        success: false,
        message: errorData.message || errorData.error || 'Failed to create post',
        post: post // Return original post data on failure
      };
    }

    // Parse successful response
    const createdPostData = await response.json();
    console.log('Post created successfully:', createdPostData);

    // Clear the cache after successful creation
    postsCache.clearCache();
    console.log('Posts cache cleared after creation.');

    // Check if the response structure is as expected
    let finalPost: Post;
    if (createdPostData && createdPostData.id) {
      // Assuming the response is the created post object itself
      finalPost = createdPostData as Post;
    } else if (createdPostData && createdPostData.post && createdPostData.post.id) {
      // Assuming the response contains a 'post' field
      finalPost = createdPostData.post as Post;
    } else {
      // Fallback if structure is unexpected
      console.warn('Unexpected create post response structure');
      finalPost = { ...post, id: 'unknown-' + Date.now() }; // Create a temporary ID
    }
    
    return {
      success: true,
      message: 'Post created successfully',
      post: finalPost
    };

  } catch (error) {
    console.error('Network or fetch error creating post:', error);
    return {
      success: false,
      message: String(error) || 'An unexpected error occurred',
      post: post // Return original post data on failure
    };
  }
}

/**
 * Update a blog post by slug
 */
export async function updatePost(slug: string, post: Post): Promise<Post | null> {
  const url = `${getBaseUrl()}/api/blog/${slug}`;
  console.log('Updating post at:', url);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(post),
      cache: 'no-store' // Avoid caching PUT requests
    });

    if (!response.ok) {
      console.error(`API error updating post: ${response.status}`);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) { /* Ignore if no JSON body */ }
      return null; // Indicate failure
    }

    const updatedPost = await response.json();
    console.log('Post updated successfully:', updatedPost);
    
    // Clear the cache after successful update
    postsCache.clearCache();
    console.log('Posts cache cleared after update.');

    return updatedPost;

  } catch (error) {
    console.error('Network or fetch error updating post:', error);
    return null;
  }
}

/**
 * Delete a blog post by slug
 */
export async function deletePost(slug: string): Promise<boolean> {
  const url = `${getBaseUrl()}/api/blog/${slug}`;
  console.log('Deleting post at:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        // Add authorization header if needed
        // 'Authorization': `Bearer ${API_TOKEN}`
      },
      cache: 'no-store' // Avoid caching DELETE requests
    });

    if (!response.ok) {
      console.error(`API error deleting post: ${response.status}`);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) { /* Ignore if no JSON body */ }
      return false; // Indicate failure
    }

    // Check response body for success message if needed
    try {
      const result = await response.json();
      console.log('Delete response:', result);
    } catch (e) { /* Ignore if no JSON body */ }

    // Clear the cache after successful deletion
    postsCache.clearCache();
    console.log('Posts cache cleared after deletion.');

    return true; // Indicate success

  } catch (error) {
    console.error('Network or fetch error deleting post:', error);
    return false;
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