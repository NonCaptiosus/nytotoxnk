'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchPosts, Post } from '../../lib/api';

export const runtime = 'edge';

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (e) {
        setError('Failed to load posts');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, []);
  
  // Function to format date from either timestamp or ISO string
  const formatDate = (date: number | string | undefined) => {
    if (!date) return '';
    if (typeof date === 'number') {
      return new Date(date).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Blog</h1>
        <p className="text-secondary dark:text-accent-dark">
          Loading posts...
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Blog</h1>
        <p className="text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Blog</h1>
        <p className="text-secondary dark:text-accent-dark">
          Thoughts, ideas, and tutorials on web development and technology
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {posts.map((post: Post) => (
            <article 
              key={post.id} 
              className="p-6 dark:bg-card-dark rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-3 hover:text-secondary transition-colors font-serif text-primary dark:text-text-dark">
                <Link href={`/blogs/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              
              <div className="flex items-center text-sm text-secondary dark:text-accent-dark mb-3">
                <span className="mr-3">By {post.author || 'Anonymous'}</span>
                <span>{formatDate(post.created || post.createdAt)}</span>
                
                {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="ml-4 flex gap-2">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded dark:bg-accent-dark/20 dark:text-accent-dark">
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs">+{post.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-secondary dark:text-accent-dark mb-4">
                {post.content.length > 250 
                  ? `${post.content.substring(0, 250)}...` 
                  : post.content}
              </p>
              <div className="flex justify-end">
                <Link 
                  href={`/blogs/${post.slug}`} 
                  className="text-primary hover:underline font-medium dark:text-text-dark"
                >
                  Continue Reading →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 dark:bg-card-dark rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 font-serif text-primary dark:text-text-dark">No posts yet</h2>
          <p className="text-secondary dark:text-accent-dark mb-6">
            Check back soon for new content!
          </p>
          <Link 
            href="/create-post"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 dark:bg-text-dark"
          >
            Create First Post
          </Link>
        </div>
      )}
    </div>
  );
}