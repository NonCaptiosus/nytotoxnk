'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPostBySlug, Post, updatePost } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

export const runtime = 'edge';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Post>({
    title: '',
    slug: '',
    content: '',
    author: '',
    tags: []
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [contentLength, setContentLength] = useState<number>(0);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug || typeof slug !== 'string') {
        setError('Invalid post slug');
        setIsLoading(false);
        return;
      }

      try {
        const post = await fetchPostBySlug(slug);
        if (!post) {
          setError('Post not found');
          setIsLoading(false);
          return;
        }

        setFormData({
          title: post.title,
          slug: post.slug,
          content: post.content,
          author: post.author || '',
          tags: post.tags || []
        });
        setContentLength(post.content.length);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadPost();
    }
  }, [slug, isAuthenticated, authLoading]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      console.log('Updating post:', { 
        title: formData.title,
        slug: formData.slug,
        contentLength: formData.content.length 
      });

      // Use the updatePost API function instead of direct fetch
      if (typeof slug !== 'string') {
        throw new Error('Invalid slug');
      }
      const updatedPost = await updatePost(slug, formData);
      
      if (!updatedPost) {
        throw new Error('Failed to update post');
      }

      setSuccess(true);
      
      // Redirect to the updated post after a short delay
      setTimeout(() => {
        router.push(`/blogs/${formData.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
          Loading Post...
        </h1>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6 dark:bg-neutral-700"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-6 dark:bg-neutral-700"></div>
          <div className="h-40 bg-gray-200 rounded mb-6 dark:bg-neutral-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
        Edit Blog Post
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-semibold mb-1">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Post updated successfully! Redirecting...
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

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-accent-dark dark:text-background-dark dark:hover:bg-accent-dark/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          
          <Link
            href={`/blogs/${slug}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 