import Link from 'next/link';
import { fetchPosts, Post } from '../../lib/api';

export const metadata = {
  title: 'Blog Posts',
  description: 'Read all my blog posts about web development and technology',
};

export default async function BlogsPage() {
  const posts = await fetchPosts();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600">
          Thoughts, ideas, and tutorials on web development and technology
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {posts.map((post: Post) => (
            <article 
              key={post.id} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                <Link href={`/blogs/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                {post.content.length > 250 
                  ? `${post.content.substring(0, 250)}...` 
                  : post.content}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {new Date(post.createdAt || '').toLocaleDateString()}
                </span>
                <Link 
                  href={`/blogs/${post.slug}`} 
                  className="text-primary hover:underline font-medium"
                >
                  Continue Reading →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
          <p className="text-gray-600 mb-6">
            Check back soon for new content!
          </p>
        </div>
      )}
    </div>
  );
}