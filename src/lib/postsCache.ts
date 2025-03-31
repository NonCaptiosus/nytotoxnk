'use client';

import { Post } from './api';

// Cache interface
interface CacheData {
  posts: Post[];
  timestamp: number;
  expiresIn: number; // milliseconds
}

// Cache expiry time (10 minutes)
const CACHE_EXPIRY = 10 * 60 * 1000;

// A simple singleton cache for posts
class PostsCache {
  private static instance: PostsCache;
  private cache: CacheData | null = null;
  
  private constructor() {
    // Initialize cache from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem('postsCache');
        if (cachedData) {
          this.cache = JSON.parse(cachedData);
          console.log('Loaded posts from cache with', this.cache?.posts.length, 'posts');
        }
      } catch (error) {
        console.error('Error loading cache from localStorage:', error);
        this.cache = null;
      }
    }
  }
  
  // Get singleton instance
  public static getInstance(): PostsCache {
    if (!PostsCache.instance) {
      PostsCache.instance = new PostsCache();
    }
    return PostsCache.instance;
  }
  
  // Set posts in cache
  public setPosts(posts: Post[]): void {
    this.cache = {
      posts,
      timestamp: Date.now(),
      expiresIn: CACHE_EXPIRY,
    };
    
    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('postsCache', JSON.stringify(this.cache));
        console.log(`Cached ${posts.length} posts`);
      } catch (error) {
        console.error('Error saving cache to localStorage:', error);
      }
    }
  }
  
  // Get all posts from cache
  public getPosts(): Post[] | null {
    if (!this.cache) {
      return null;
    }
    
    // Check if cache is expired
    if (Date.now() > this.cache.timestamp + this.cache.expiresIn) {
      console.log('Cache expired');
      // Clear expired cache from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('postsCache');
      }
      this.cache = null;
      return null;
    }
    
    console.log(`Using ${this.cache.posts.length} posts from cache`);
    return this.cache.posts;
  }
  
  // Get a single post by slug from cache
  public getPostBySlug(slug: string): Post | null {
    const posts = this.getPosts();
    if (!posts) {
      return null;
    }
    
    const post = posts.find(p => p.slug === slug);
    if (post) {
      console.log(`Found post '${post.title}' in cache`);
    }
    return post || null;
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('postsCache');
      console.log('Cache cleared');
    }
  }
}

// Export singleton instance
export const postsCache = PostsCache.getInstance(); 