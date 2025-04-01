'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPostBySlug, Post } from '@/lib/api';
import { usePostsContext } from '@/providers/PostsProvider';

export const runtime = 'edge';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPostBySlug } = usePostsContext();

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (typeof slug !== 'string') {
          throw new Error('Invalid slug');
        }
        
        console.log(`Loading post with slug: ${slug}`);
        
        // First try to get the post from context
        const cachedPost = getPostBySlug(slug);
        if (cachedPost) {
          console.log(`Using cached post from context with content length: ${cachedPost.content?.length || 0}`);
          setPost(cachedPost);
          setLoading(false);
          return;
        }
        
        // If not in context, fetch it
        console.log(`Fetching post by slug: ${slug}`);
        const data = await fetchPostBySlug(slug);
        if (!data) {
          throw new Error('Post not found');
        }
        
        console.log(`Received post data with content length: ${data.content?.length || 0}`);
        setPost(data);
      } catch (err) {
        console.error(`Error loading post with slug ${slug}:`, err);
        setError('Failed to load blog post. It may have been removed or doesn\'t exist.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, getPostBySlug]);

  // Function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to render content with proper paragraphs
  const renderContent = (content: string | undefined) => {
    if (!content) return <p className="dark:text-gray-200">This post has no content.</p>;
    
    try {
      // Split by paragraphs and filter out empty ones
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim() !== '');
      
      if (paragraphs.length === 0) {
        // If no paragraphs, just render the content as a single block
        return <p className="dark:text-gray-200 mb-4">{content}</p>;
      }
      
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="dark:text-gray-200 mb-4">{paragraph}</p>
      ));
    } catch (e) {
      console.error('Error rendering content:', e);
      return <p className="dark:text-gray-200">{content}</p>;
    }
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
          
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
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
          
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded dark:bg-accent-dark/20 dark:text-accent-dark">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="prose max-w-none dark:prose-invert">
          {renderContent(post.content)}
        </div>
      </article>
      
      <div className="mt-12">
        <Link 
          href="/blogs" 
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors dark:bg-card-dark dark:text-text-dark dark:hover:bg-accent-dark/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to all posts
        </Link>
      </div>
    </div>
  );
} 