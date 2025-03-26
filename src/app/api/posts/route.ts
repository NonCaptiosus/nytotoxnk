import { NextResponse } from 'next/server';

// Define error response interface
interface ErrorResponse {
  error?: string;
  [key: string]: any;
}

export async function GET() {
  try {
    console.log('GET /api/posts: Request received');
    
    // Get the Cloudflare Worker URL
    // Use local worker when in development
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787';
    console.log(`GET /api/posts: Using worker URL: ${workerUrl}`);
    
    // Forward the request to the Cloudflare Worker
    try {
      const response = await fetch(`${workerUrl}/api/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache', // Ensure we're not getting cached responses
      });
      
      console.log(`GET /api/posts: Worker responded with status ${response.status}`);
      
      if (!response.ok) {
        // Clone the response before reading it
        const clonedResponse = response.clone();
        
        try {
          const errorData = await clonedResponse.json() as ErrorResponse;
          console.error('GET /api/posts: Error response from worker:', errorData);
          return NextResponse.json(
            { error: errorData.error || `Request failed with status: ${response.status}` },
            { status: response.status }
          );
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            console.error('GET /api/posts: Error response from worker (text):', errorText);
            return NextResponse.json(
              { error: `Request failed with status: ${response.status}` },
              { status: response.status }
            );
          } catch (textError) {
            console.error('GET /api/posts: Could not read error response:', textError);
            return NextResponse.json(
              { error: `Request failed with status: ${response.status}` },
              { status: response.status }
            );
          }
        }
      }
      
      // Return the successful response
      const data = await response.json();
      console.log(`GET /api/posts: Successfully retrieved ${Array.isArray(data) ? data.length : 0} posts`);
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('GET /api/posts: Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to the Cloudflare Worker API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('GET /api/posts: Unhandled server-side error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
} 