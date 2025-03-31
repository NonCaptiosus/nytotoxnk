'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export const runtime = 'edge';

// Project interface
interface Project {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  technologies: string[];
  imageUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Project>({
    slug: '',
    title: '',
    description: '',
    content: '',
    technologies: []
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!slug || typeof slug !== 'string') {
        setError('Invalid project slug');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching project: ${response.status}`);
        }
        
        const project = await response.json() as Project;
        
        if (!project) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }

        setFormData({
          slug: project.slug,
          title: project.title,
          description: project.description,
          content: project.content || '',
          technologies: project.technologies || [],
          imageUrl: project.imageUrl,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadProject();
    }
  }, [slug, isAuthenticated, authLoading]);

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
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      const response = await fetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || `Failed to update project: ${response.status}`);
      }

      setSuccess(true);
      
      // Redirect to the updated project after a short delay
      setTimeout(() => {
        router.push(`/projects/${formData.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark">
          Loading Project...
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
        Edit Project
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-semibold mb-1">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Project updated successfully! Redirecting...
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
            placeholder="Enter project title"
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
            placeholder="project-slug"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
          <p className="mt-1 text-sm text-secondary dark:text-accent-dark">
            This will be used in the URL: /projects/{formData.slug || 'project-slug'}
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the project"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
            required
          />
        </div>
        
        <div>
          <label
            htmlFor="technologies"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Technologies (comma-separated)
          </label>
          <input
            type="text"
            id="technologies"
            name="technologies"
            value={formData.technologies?.join(', ')}
            onChange={(e) => {
              const techArray = e.target.value
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== '');
              setFormData(prev => ({
                ...prev,
                technologies: techArray
              }));
            }}
            placeholder="React, TypeScript, Node.js"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
          />
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
          />
        </div>

        <div>
          <label
            htmlFor="repoUrl"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Repository URL
          </label>
          <input
            type="text"
            id="repoUrl"
            name="repoUrl"
            value={formData.repoUrl || ''}
            onChange={handleChange}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
          />
        </div>

        <div>
          <label
            htmlFor="demoUrl"
            className="block mb-2 font-medium text-primary dark:text-text-dark"
          >
            Demo URL
          </label>
          <input
            type="text"
            id="demoUrl"
            name="demoUrl"
            value={formData.demoUrl || ''}
            onChange={handleChange}
            placeholder="https://your-demo-site.com"
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
            placeholder="Detailed description of the project, challenges, solutions, etc."
            rows={10}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-card-dark"
          />
          <p className="mt-1 text-sm text-secondary dark:text-accent-dark">
            Supports markdown formatting.
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
            href={`/projects/${slug}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 