'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Test the Next.js API that serves as proxy to the worker
  const testNextApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (error) {
      console.error('Error testing Next.js API:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };
  
  // Test the direct connection to the worker (for debugging)
  const testDirectWorker = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8787/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (error) {
      console.error('Error testing direct worker connection:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testNextApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 mr-4"
        >
          Test Next.js API Route
        </button>
        
        <button 
          onClick={testDirectWorker}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test Direct Worker Connection
        </button>
      </div>
      
      {loading && (
        <div className="mt-4 text-gray-600">Testing connection...</div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <div className="p-4 bg-gray-100 rounded overflow-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 