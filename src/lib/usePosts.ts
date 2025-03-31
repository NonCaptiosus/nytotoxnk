'use client';

import { useState, useEffect } from 'react';
import { fetchPosts, Post } from './api';

/**
 * Custom hook to load and manage posts
 */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load posts on first render
  useEffect(() => {
    if (!initialized) {
      loadPosts();
    }
  }, [initialized]);

  // Function to load posts
  async function loadPosts() {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
      setInitialized(true);
    } catch (e) {
      console.error('Error loading posts:', e);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  // Function to reload posts from API (bypassing cache)
  async function reloadPosts() {
    // This will repopulate the cache
    await loadPosts();
  }

  // Function to get a post by slug
  function getPostBySlug(slug: string): Post | undefined {
    return posts.find(post => post.slug === slug);
  }

  return {
    posts,
    loading,
    error,
    initialized,
    loadPosts,
    reloadPosts,
    getPostBySlug
  };
} 