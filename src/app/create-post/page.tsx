'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, Post } from '@/lib/api';

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Post>({
    title: '',
    slug: '',
    content: '',
    author: '',
    tags: []
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  useEffect(() => {
    setContentLength(formData.content.length);
  }, [formData.content]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting - prevent submitting more than once every 5 seconds
    const now = Date.now();
    if (lastSubmitTime && now - lastSubmitTime < 5000) {
      setError('Please wait a few seconds before submitting again');
      return;
    }
    
    setLastSubmitTime(now);
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.slug.trim()) {
        throw new Error('Slug is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      
      // Validate content length
      if (formData.content.length > 100000) {
        throw new Error('Content is too long. Please keep it under 100,000 characters.');
      }

      // Log submission attempt
      console.log('Submitting post:', { 
        title: formData.title,
        slug: formData.slug,
        contentLength: formData.content.length 
      });

      const result = await createPost(formData);
      
      if (result) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          slug: '',
          content: '',
          author: '',
          tags: []
        });
        
        // Redirect to the new post after a short delay
        setTimeout(() => {
          router.push(`/blogs/${result.post.slug}`);
        }, 1500);
      } else {
        throw new Error('Failed to create post: No response data received');
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error details:', err);
        
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Unable to connect to the server. There might be a network issue.');
        } else if (err.message.includes('worker') || err.message.includes('500')) {
          setError('The server encountered an error processing your request. The post may be too large or contain invalid data.');
        } else if (err.message.includes('API error')) {
          // Extract the actual error message from the API error format
          const errorMessage = err.message.replace('API error: ', '');
          setError(errorMessage);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
        console.error('Unknown error type:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
        Create New Blog Post
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-semibold mb-1">Error:</p>
          <p>{error}</p>
          {(error.includes('server encountered an error') || error.includes('500')) && (
            <div className="mt-2 text-sm">
              <p>Possible solutions:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Try shortening your content - very long posts might cause issues</li>
                <li>Remove any special characters or formatting that might be causing problems</li>
                <li>Check that your slug is unique and contains only letters, numbers, and hyphens</li>
              </ul>
            </div>
          )}
          {error.includes('Unable to connect') && (
            <div className="mt-2 text-sm">
              <p>Possible solutions:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Check your internet connection</li>
                <li>Refresh the page and try again</li>
                <li>If the problem persists, the server might be temporarily unavailable</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Post created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter post title"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Slug (URL)
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="enter-post-slug"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
          <p className="mt-1 text-sm text-secondary dark:text-accent-dark">
            This will be used in the URL: /blogs/{formData.slug || 'your-post-slug'}
          </p>
        </div>

        <div>
          <label
            htmlFor="author"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
        </div>
        
        <div>
          <label
            htmlFor="tags"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags?.join(', ')}
            onChange={(e) => {
              const tagsArray = e.target.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');
              setFormData(prev => ({
                ...prev,
                tags: tagsArray
              }));
            }}
            placeholder="web, technology, coding"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your blog post content here..."
            rows={12}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
          <p className="mt-1 text-sm text-secondary dark:text-accent-dark flex justify-between">
            <span>Supports markdown formatting. Split paragraphs with a blank line.</span>
            <span className={contentLength > 90000 ? "text-red-500 font-medium" : ""}>
              {contentLength} / 100,000 characters
            </span>
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-text-dark dark:text-background-dark dark:hover:bg-text-dark/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 