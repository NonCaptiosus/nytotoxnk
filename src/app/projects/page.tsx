// Remove 'use client'; directive

// Remove client-side hooks and API imports
// import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useAuth } from '@/lib/authContext';
// import { deleteProject } from '@/lib/api';

// Remove runtime = 'edge' if not needed for server component, or keep if desired
// export const runtime = 'edge';

// Define the structure for a project in our manual list
interface ManualProject { 
  slug: string;         // Unique identifier, used in the URL (e.g., 'what-data-we-see')
  title: string;        // The main title of the project
  description: string;  // A short description shown on the card
  href: string;         // The path to link to (e.g., '/projects/what-data-we-see')
  // Optional: Add other fields if needed for display, like tags or an image URL
  // technologies?: string[];
  // imageUrl?: string;
}

// --- MANUALLY CURATED PROJECT LIST --- 
// Add new projects to this array following the ManualProject structure.
const manualProjects: ManualProject[] = [
  {
    slug: 'what-data-we-see',
    title: 'What Data We See From You',
    description: 'Explore the information your browser shares when visiting websites.',
    href: '/projects/what-data-we-see',
    // technologies: ['Next.js', 'React', 'TailwindCSS'], // Example
  },
  // {
  //   slug: 'another-project',
  //   title: 'Another Cool Project',
  //   description: 'Description for the second project.',
  //   href: '/projects/another-project',
  // },
  // Add more projects here...
];
// --- END OF PROJECT LIST ---

export default function ProjectsPage() {
  // Remove state variables: isAuthenticated, projects, loading, error, deleteModal, etc.

  // Remove useEffect hook for fetching
  // useEffect(() => { ... });

  // Remove delete handlers
  // const handleDeleteClick = ...
  // const closeDeleteModal = ...
  // const confirmDelete = ...

  // Remove Loading state UI
  // if (loading) { ... }

  // Remove Error state UI
  // if (error) { ... }

  // --- Main Page Render --- 
  return (
    <div className="max-w-4xl mx-auto p-4"> {/* Added padding & removed outer div */} 
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Projects</h1>
          <p className="text-secondary dark:text-accent-dark">
            A collection of my web development and cloud computing projects
          </p>
        </div>
        {/* Removed Add Project button - Requires auth state */}
        {/* {isAuthenticated && ( <Link href="/create-project">...</Link> )} */}
      </div>

      {/* Check if the manual list is empty */}
      {manualProjects.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
          <p className="text-secondary dark:text-accent-dark mb-4">No projects listed yet.</p>
          {/* Removed Create Project button */}
        </div>
      ) : (
        // Render the grid using the manualProjects array
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {manualProjects.map((project) => (
            // Project Card - Simplified: Removed edit/delete, optional fields 
            <div key={project.slug} className="p-6 dark:bg-card-dark rounded-lg relative group border dark:border-gray-700 hover:shadow-lg transition-shadow">
              {/* Removed Edit/Delete buttons */}

              <Link href={project.href} className="block">
                <h2 className="text-2xl font-bold mb-2 text-primary dark:text-text-dark font-serif">{project.title}</h2>
                <p className="text-secondary dark:text-accent-dark mb-4">{project.description}</p>
              </Link>
              
              {/* Optional: Render technologies if added to ManualProject and the list */}
              {/* {project.technologies && project.technologies.length > 0 && (
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
              )} */}
              
              {/* Removed GitHub/Demo links - Add back if needed in ManualProject */}
            </div>
          ))}
        </div>
      )}

      {/* Removed Delete Confirmation Modal */}
    </div>
  );
} 