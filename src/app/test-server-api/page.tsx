'use client';

import { useState } from 'react';
import { fetchPosts, fetchPostBySlug, createPost } from '@/lib/api';

export default function TestServerApiPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [testType, setTestType] = useState<'fetch-all' | 'fetch-slug' | 'create'>('fetch-all');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('Test Post');
  const [content, setContent] = useState('This is a test post created via server API.');

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      switch (testType) {
        case 'fetch-all':
          console.log('Testing fetchPosts()');
          const posts = await fetchPosts();
          setResult(posts);
          break;
          
        case 'fetch-slug':
          if (!slug) {
            setError('Please enter a slug to fetch');
            break;
          }
          console.log(`Testing fetchPostBySlug("${slug}")`);
          const post = await fetchPostBySlug(slug);
          setResult(post);
          break;
          
        case 'create':
          if (!title || !content) {
            setError('Title and content are required');
            break;
          }
          console.log('Testing createPost()');
          const newPost = {
            title,
            slug: slug || `test-post-${Date.now()}`,
            content
          };
          try {
            const createdPost = await createPost(newPost);
            setResult(createdPost);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
          break;
      }
    } catch (e) {
      console.error('Error running test:', e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Server-Side API Routes</h1>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-medium">Test Type:</span>
          <select 
            value={testType} 
            onChange={(e) => setTestType(e.target.value as any)}
            className="ml-2 p-2 border rounded"
          >
            <option value="fetch-all">Fetch All Posts</option>
            <option value="fetch-slug">Fetch Post by Slug</option>
            <option value="create">Create Post</option>
          </select>
        </label>
      </div>
      
      {testType === 'fetch-slug' && (
        <div className="mb-4">
          <label className="block mb-2">
            <span className="font-medium">Slug:</span>
            <input 
              type="text" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)}
              className="ml-2 p-2 border rounded w-64"
              placeholder="post-slug"
            />
          </label>
        </div>
      )}
      
      {testType === 'create' && (
        <>
          <div className="mb-4">
            <label className="block mb-2">
              <span className="font-medium">Title:</span>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="ml-2 p-2 border rounded w-64"
                placeholder="Post Title"
              />
            </label>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">
              <span className="font-medium">Slug (optional):</span>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                className="ml-2 p-2 border rounded w-64"
                placeholder="Auto-generated if empty"
              />
            </label>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">
              <span className="font-medium">Content:</span>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="block w-full mt-1 p-2 border rounded h-32"
              />
            </label>
          </div>
        </>
      )}
      
      <button 
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Run Test'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded text-red-800">
          <h3 className="font-bold mb-2">Error</h3>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Result</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 