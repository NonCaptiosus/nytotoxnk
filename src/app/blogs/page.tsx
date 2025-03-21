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
        <h1 className="text-4xl font-bold mb-2 font-serif text-primary dark:text-text-dark">Blog</h1>
        <p className="text-secondary dark:text-accent-dark">
          Thoughts, ideas, and tutorials on web development and technology
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {posts.map((post: Post) => (
            <article 
              key={post.id} 
              className="p-6 dark:bg-card-dark"
            >
              <h2 className="text-2xl font-bold mb-3 hover:text-secondary transition-colors font-serif text-primary dark:text-text-dark">
                <Link href={`/blogs/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="text-secondary dark:text-accent-dark mb-4">
                {post.content.length > 250 
                  ? `${post.content.substring(0, 250)}...` 
                  : post.content}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary dark:text-accent-dark">
                  {new Date(post.createdAt || '').toLocaleDateString()}
                </span>
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
        <div className="text-center py-16 dark:bg-card-dark">
          <h2 className="text-2xl font-semibold mb-2 font-serif text-primary dark:text-text-dark">No posts yet</h2>
          <p className="text-secondary dark:text-accent-dark mb-6">
            Check back soon for new content!
          </p>
        </div>
      )}
    </div>
  );
}