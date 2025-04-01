'use client';

import Link from 'next/link';
import { usePostsContext } from '../../providers/PostsProvider';
import { useAuth } from '@/lib/authContext';
import { useState } from 'react';
import { deletePost } from '@/lib/api';

export const runtime = 'edge';

export default function BlogsPage() {
  const { posts, loading, error, reloadPosts } = usePostsContext();
  const { isAuthenticated } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Function to format date from either timestamp or ISO string
  const formatDate = (date: number | string | undefined) => {
    if (!date) return '';
    if (typeof date === 'number') {
      return new Date(date).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  // Function to handle post deletion
  const handleDeletePost = async (slug: string) => {
    if (!isAuthenticated) {
      setDeleteError('You must be logged in to delete posts');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      console.log(`Attempting to delete post with slug: ${slug}`);
      
      // Use the deletePost API function instead of direct fetch
      const success = await deletePost(slug);
      
      if (success) {
        console.log(`Successfully deleted post: ${slug}`);
        // Reload posts after deletion
        await reloadPosts();
        setDeleteConfirm(null);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Blog</h1>
          <p className="text-secondary dark:text-accent-dark">
            Thoughts, ideas, and tutorials on web development and technology
          </p>
        </div>
        {isAuthenticated && (
          <Link 
            href="/create-post"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 dark:bg-accent-dark dark:text-background-dark"
          >
            Create New Post
          </Link>
        )}
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p>{deleteError}</p>
          <button 
            onClick={() => setDeleteError(null)}
            className="text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id || post.slug} 
              className="p-6 dark:bg-card-dark rounded-lg relative"
            >
              {isAuthenticated && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Link 
                    href={`/edit-post/${post.slug}`}
                    className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                    title="Edit post"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Link>
                  {deleteConfirm === post.slug ? (
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleDeletePost(post.slug)}
                        disabled={isDeleting}
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors disabled:opacity-50"
                        title="Confirm delete"
                      >
                        {isDeleting ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(null)}
                        className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors"
                        title="Cancel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirm(post.slug)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors"
                      title="Delete post"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <h2 className="text-2xl font-bold mb-3 hover:text-secondary transition-colors font-serif text-primary dark:text-text-dark pr-20">
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
                {post.content && post.content.length > 0 
                  ? (post.content.length > 250 
                      ? `${post.content.substring(0, 250).trim()}...` 
                      : post.content.trim())
                  : 'No content available.'}
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
          {isAuthenticated && (
            <Link 
              href="/create-post"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 dark:bg-text-dark dark:text-background-dark"
            >
              Create First Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}