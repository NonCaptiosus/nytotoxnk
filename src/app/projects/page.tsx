'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export const runtime = 'edge';

export const metadata = {
  title: 'Projects',
  description: 'Check out my web development and cloud projects',
};

// Project type definition
interface Project {
  id?: string;
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  content?: string;
}

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, projectSlug: string}>({ show: false, projectSlug: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error(`Error fetching projects: ${response.status}`);
        }
        
        const data = await response.json() as Project[];
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteClick = (slug: string) => {
    setDeleteModal({ show: true, projectSlug: slug });
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, projectSlug: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.projectSlug) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects/${deleteModal.projectSlug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || `Failed to delete project: ${response.status}`);
      }

      // Remove the deleted project from the state
      setProjects(projects.filter(project => project.slug !== deleteModal.projectSlug));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting project:', err);
      setDeleteError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Projects</h1>
          <p className="text-secondary dark:text-accent-dark">
            Loading projects...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 dark:bg-card-dark rounded-lg animate-pulse">
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-4 dark:bg-neutral-700"></div>
              <div className="h-20 bg-gray-200 rounded mb-4 dark:bg-neutral-700"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2 dark:bg-neutral-700"></div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-7 bg-gray-200 rounded-full w-20 dark:bg-neutral-700"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Projects</h1>
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <p className="font-semibold mb-1">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Projects</h1>
          <p className="text-secondary dark:text-accent-dark">
            A collection of my web development and cloud computing projects
          </p>
        </div>
        {isAuthenticated && (
          <Link 
            href="/create-project" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors dark:bg-accent-dark dark:text-background-dark dark:hover:bg-accent-dark/90"
          >
            Add Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
          <p className="text-secondary dark:text-accent-dark mb-4">No projects found</p>
          {isAuthenticated && (
            <Link 
              href="/create-project" 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors dark:bg-accent-dark dark:text-background-dark dark:hover:bg-accent-dark/90"
            >
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.slug} className="p-6 dark:bg-card-dark rounded-lg relative group">
              {/* Edit/Delete buttons for authenticated users */}
              {isAuthenticated && (
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/edit-project/${project.slug}`}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    aria-label="Edit project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(project.slug)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    aria-label="Delete project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}

              <Link href={`/projects/${project.slug}`} className="block">
                <h2 className="text-2xl font-bold mb-2 text-primary dark:text-text-dark font-serif">{project.title}</h2>
                <p className="text-secondary dark:text-accent-dark mb-4">{project.description}</p>
              </Link>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-secondary dark:text-accent-dark mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full text-sm border border-secondary dark:border-accent-dark text-secondary dark:text-accent-dark">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                {project.repoUrl && (
                  <a 
                    href={project.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium dark:text-text-dark"
                  >
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium dark:text-text-dark"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-background-dark rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-primary dark:text-text-dark">Delete Project</h3>
            <p className="mb-6 text-secondary dark:text-accent-dark">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 