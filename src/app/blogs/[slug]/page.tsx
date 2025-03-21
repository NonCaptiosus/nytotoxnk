import Link from 'next/link';
import { fetchPostBySlug } from '../../../lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found',
    };
  }
  
  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <article className="max-w-4xl mx-auto">
      <Link 
        href="/blogs" 
        className="text-primary hover:underline mb-6 inline-block"
      >
        ← Back to all posts
      </Link>
      
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex items-center text-gray-500 mb-8">
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt || '').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <span className="ml-4">
            Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
      
      <div className="prose prose-lg max-w-none">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
} 