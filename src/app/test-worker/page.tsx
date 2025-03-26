'use client';

import { useState } from 'react';

// Use a simpler token for local development
const API_TOKEN = '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55';

// Define error response interface
interface ErrorResponse {
  error?: string;
  [key: string]: any;
}

export default function TestWorkerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [endpoint, setEndpoint] = useState('/api/posts');
  const [postData, setPostData] = useState(JSON.stringify({
    title: 'Test Post',
    slug: 'test-post-' + Date.now(),
    content: 'This is a test post created via direct worker API.'
  }, null, 2));

  const testWorker = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const workerUrl = 'http://127.0.0.1:8787'; // Local worker URL
      const fullUrl = `${workerUrl}${endpoint}`;
      
      console.log(`Testing worker with ${method} ${fullUrl}`);
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      };
      
      // Add authorization header and body for POST requests
      if (method === 'POST') {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${API_TOKEN}`
        };
        
        try {
          const parsedData = JSON.parse(postData);
          options.body = JSON.stringify(parsedData);
        } catch (e) {
          setError('Invalid JSON in post data');
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch(fullUrl, options);
      console.log(`Worker responded with status ${response.status}`);
      
      if (!response.ok) {
        try {
          const errorData = await response.json() as ErrorResponse;
          setError(`Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        } catch (e) {
          try {
            const text = await response.text();
            setError(`Error: ${response.status} - ${text.substring(0, 500)}`);
          } catch (e2) {
            setError(`Error: ${response.status}`);
          }
        }
      } else {
        try {
          const data = await response.json();
          setResult(data);
        } catch (e) {
          const text = await response.text();
          setResult({ rawText: text });
        }
      }
    } catch (e) {
      console.error('Error testing worker:', e);
      setError(`Connection error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Cloudflare Worker Directly</h1>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-medium">Method:</span>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
            className="ml-2 p-2 border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-medium">Endpoint:</span>
          <input 
            type="text" 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            className="ml-2 p-2 border rounded w-64"
          />
        </label>
      </div>
      
      {method === 'POST' && (
        <div className="mb-4">
          <label className="block mb-2">
            <span className="font-medium">Request Body (JSON):</span>
            <textarea 
              value={postData} 
              onChange={(e) => setPostData(e.target.value)}
              className="block w-full mt-1 p-2 border rounded font-mono text-sm h-40"
              spellCheck={false}
            />
          </label>
        </div>
      )}
      
      <button 
        onClick={testWorker}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Worker'}
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