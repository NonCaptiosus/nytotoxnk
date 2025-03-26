'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPostBySlug, Post } from '@/lib/api';

export const runtime = 'edge';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (typeof slug !== 'string') {
          throw new Error('Invalid slug');
        }
        
        const data = await fetchPostBySlug(slug);
        if (!data) {
          throw new Error('Post not found');
        }
        setPost(data);
      } catch (err) {
        console.error(`Error loading post with slug ${slug}:`, err);
        setError('Failed to load blog post. It may have been removed or doesn\'t exist.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  // Function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
          {error || 'Post not found'}
        </div>
        <Link href="/blogs" className="text-blue-600 hover:underline">
          ← Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">By {post.author || 'Anonymous'}</span>
            {post.created && <time>{formatDate(post.created)}</time>}
            {post.createdAt && !post.created && (
              <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            )}
            {post.updated && post.updated !== post.created && (
              <span className="ml-4 text-sm">(Updated: {formatDate(post.updated)})</span>
            )}
            {post.updatedAt && !post.updated && post.updatedAt !== post.createdAt && (
              <span className="ml-4 text-sm">(Updated: {new Date(post.updatedAt).toLocaleDateString()})</span>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="prose max-w-none">
          {/* Split content by paragraphs and render */}
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
      
      <div className="mt-12 pt-6 border-t">
        <Link href="/blogs" className="text-blue-600 hover:underline">
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
} 