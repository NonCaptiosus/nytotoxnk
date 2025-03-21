import Link from 'next/link';
import { fetchPosts, Post } from '../lib/api';

export default async function Home() {
  const posts = await fetchPosts();
  
  return (
    <div className="space-y-8">
      <section className="bg-primary text-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Personal Blog</h1>
        <p className="text-xl mb-6">
          Exploring web development, cloud technologies, and more.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/blogs" 
            className="bg-white text-primary px-6 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Read Blog
          </Link>
          <Link 
            href="/projects" 
            className="border border-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-primary transition-colors"
          >
            View Projects
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Latest Posts</h2>
          <Link 
            href="/blogs" 
            className="text-primary hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts && posts.length > 0 ? (
            posts.slice(0, 3).map((post: Post) => (
              <div key={post.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                    <Link href={`/blogs/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.content.length > 150 
                      ? `${post.content.substring(0, 150)}...` 
                      : post.content}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {new Date(post.createdAt || '').toLocaleDateString()}
                    </span>
                    <Link 
                      href={`/blogs/${post.slug}`} 
                      className="text-primary hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center py-8 text-gray-500">
              No posts found. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
} 