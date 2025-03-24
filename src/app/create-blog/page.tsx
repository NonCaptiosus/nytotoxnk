'use client';

import React, { useState } from 'react';
import { createPost, NewPost } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);
    
    // Clear previous logs on new submission
    setLogs([]);
    
    // Basic validation
    if (!title || !slug || !content) {
      setSubmitResult({
        success: false,
        message: 'All fields are required',
      });
      setIsSubmitting(false);
      return;
    }
    
    // Create a slug if not provided
    let slugToUse = slug;
    if (!slugToUse) {
      slugToUse = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    const newPost: NewPost = {
      title,
      slug: slugToUse,
      content,
    };
    
    addLog(`Preparing to submit post: ${JSON.stringify(newPost)}`);
    
    try {
      addLog('Sending post to API...');
      const result = await createPost(newPost);
      addLog(`API response: ${JSON.stringify(result)}`);
      
      setSubmitResult({
        success: result.success,
        message: result.message,
      });
      
      if (result.success) {
        // Clear form on success
        setTitle('');
        setSlug('');
        setContent('');
        
        addLog('Post created successfully.');
        
        // If we're in dev mode with a mock post
        if (result.message.includes('DEV MODE')) {
          addLog('Note: This was a simulated success in development mode. The post was not actually sent to the server.');
        } else if (result.post) {
          addLog(`Post ID: ${result.post.id}`);
          
          // Optionally navigate to the new post after a delay
          setTimeout(() => {
            router.push(`/blogs/${result.post?.slug}`);
          }, 2000);
        }
      } else {
        addLog(`Error: ${result.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${errorMessage}`);
      setSubmitResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const generateSlug = () => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
      addLog(`Generated slug: ${generatedSlug}`);
    } else {
      addLog('Please enter a title first to generate a slug');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-primary dark:text-text-dark font-serif">Create New Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary dark:text-accent-dark mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:bg-card-dark dark:text-text-dark"
            placeholder="Enter post title"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="slug" className="block text-sm font-medium text-secondary dark:text-accent-dark">
              Slug
            </label>
            <button
              type="button"
              onClick={generateSlug}
              className="text-xs text-primary dark:text-accent-dark hover:underline"
            >
              Generate from title
            </button>
          </div>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:bg-card-dark dark:text-text-dark"
            placeholder="enter-post-slug"
          />
          <p className="mt-1 text-xs text-secondary dark:text-accent-dark">
            The slug will be used in the post URL (e.g., /blogs/your-slug)
          </p>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-secondary dark:text-accent-dark mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:bg-card-dark dark:text-text-dark"
            placeholder="Write your blog post content here..."
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors dark:bg-accent-dark dark:text-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Create Post'}
          </button>
          
          <div className="text-xs text-secondary dark:text-accent-dark">
            <p>Note: If the API is unavailable, posts will be saved in development mode only.</p>
          </div>
        </div>
      </form>
      
      {submitResult && (
        <div className={`mt-6 p-4 rounded-md ${submitResult.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <p className={`text-sm font-medium ${submitResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
            {submitResult.message}
          </p>
          {submitResult.success && submitResult.message.includes('DEV MODE') && (
            <p className="mt-2 text-xs text-green-700 dark:text-green-300">
              The API is currently unavailable. This is a simulated success in development mode.
            </p>
          )}
        </div>
      )}
      
      {/* Logs section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-primary dark:text-text-dark font-serif">API Logs</h2>
        <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-md max-h-60 overflow-y-auto">
          {logs.length > 0 ? (
            <ul className="text-xs font-mono space-y-1">
              {logs.map((log, index) => (
                <li key={index} className="text-secondary dark:text-accent-dark">
                  {log}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-secondary dark:text-accent-dark">No logs yet. Create a post to see API interaction.</p>
          )}
        </div>
      </div>
      
      {/* API Status Information */}
      <div className="mt-8 p-4 border border-gray-200 dark:border-neutral-700 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-primary dark:text-text-dark">API Status</h3>
        <p className="text-sm text-secondary dark:text-accent-dark mb-2">
          The Cloudflare Worker API is experiencing issues with CORS and returning 500 errors. 
          We have implemented fallback behavior for viewing content and a development mode for creating content.
        </p>
        <p className="text-sm text-secondary dark:text-accent-dark">
          To fix the Cloudflare Worker, handle OPTIONS requests and ensure proper CORS headers are returned.
        </p>
      </div>
    </div>
  );
} 