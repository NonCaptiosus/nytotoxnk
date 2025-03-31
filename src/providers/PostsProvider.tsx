'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePosts } from '@/lib/usePosts';
import { Post } from '@/lib/api';

// Define the Context type
interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadPosts: () => Promise<void>;
  reloadPosts: () => Promise<void>;
  getPostBySlug: (slug: string) => Post | undefined;
}

// Create the Context with a default value
const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Custom hook to use the posts context
export function usePostsContext() {
  const context = useContext(PostsContext);
  
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  
  return context;
}

// Provider Component
export function PostsProvider({ children }: { children: ReactNode }) {
  const postsData = usePosts();
  
  return (
    <PostsContext.Provider value={postsData}>
      {children}
    </PostsContext.Provider>
  );
} 