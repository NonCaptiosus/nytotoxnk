'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePostsContext } from '../providers/PostsProvider';

export const runtime = 'edge';

export default function Home() {
  const { posts, loading, error } = usePostsContext();
  
  if (loading) {
    return (
      <div className="space-y-12">
        <section>
          <h1 className="text-4xl font-bold mb-4 font-serif text-primary dark:text-text-dark">Welcome to My Blog</h1>
          <p className="text-xl mb-6 text-secondary dark:text-accent-dark">
            Exploring web development, cloud technologies, cybersecurity & networking, IoT, AI & Machine Learning
          </p>
          <div className="flex gap-4">
            <div className="bg-primary text-white px-6 py-2 rounded dark:bg-accent-dark dark:text-background-dark">
              Loading...
            </div>
          </div>
        </section>
      </div>
    );
  }
  
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold mb-4 font-serif text-primary dark:text-text-dark">Welcome to My Blog</h1>
        <p className="text-xl mb-6 text-secondary dark:text-accent-dark">
          Exploring web development, cloud technologies, cybersecurity & networking, IoT, AI & Machine Learning
        </p>
        <div className="flex gap-4">
          <Link 
            href="/blogs" 
            className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors dark:bg-accent-dark dark:text-background-dark"
          >
            Read Blog
          </Link>
          <Link 
            href="/projects" 
            className="border border-primary text-primary px-6 py-2 rounded hover:bg-gray-50 transition-colors dark:border-accent-dark dark:text-text-dark dark:hover:bg-neutral-800"
          >
            View Projects
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-serif text-primary dark:text-text-dark">Latest Posts</h2>
          <Link 
            href="/blogs" 
            className="text-primary hover:underline font-medium dark:text-accent-dark"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts && posts.length > 0 ? (
            posts.slice(0, 3).map((post) => (
              <div key={post.id || post.slug} className="dark:bg-card-dark p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 hover:text-secondary transition-colors font-serif text-primary dark:text-text-dark">
                  <Link href={`/blogs/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-secondary dark:text-accent-dark mb-4">
                  {post.content && post.content.length > 0 
                    ? (post.content.length > 150 
                        ? `${post.content.substring(0, 150).trim()}...` 
                        : post.content.trim())
                    : 'No content available.'}
                </p>
                <div className="flex justify-between items-center text-sm text-secondary dark:text-accent-dark">
                  <span>
                    {post.created 
                      ? new Date(post.created).toLocaleDateString()
                      : post.createdAt 
                        ? new Date(post.createdAt).toLocaleDateString() 
                        : ''}
                  </span>
                  <Link 
                    href={`/blogs/${post.slug}`} 
                    className="text-primary hover:underline dark:text-text-dark"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center py-8 text-secondary dark:text-accent-dark">
              {error || "No posts found. Check back soon!"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
} 