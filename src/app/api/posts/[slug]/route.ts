import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Define error response interface
interface ErrorResponse {
  error?: string;
  [key: string]: any;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log(`GET /api/posts/${params.slug}: Request received`);
    
    // Get the Cloudflare Worker URL
    // Use local worker when in development
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787';
    console.log(`GET /api/posts/${params.slug}: Using worker URL: ${workerUrl}`);
    
    // Forward the request to the Cloudflare Worker
    try {
      const response = await fetch(`${workerUrl}/api/posts/${params.slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache', // Ensure we're not getting cached responses
      });
      
      console.log(`GET /api/posts/${params.slug}: Worker responded with status ${response.status}`);
      
      if (!response.ok) {
        // Handle 404 specifically
        if (response.status === 404) {
          return NextResponse.json(
            { error: `Post with slug '${params.slug}' not found` },
            { status: 404 }
          );
        }
        
        // Handle other errors
        // Clone the response before reading it
        const clonedResponse = response.clone();
        
        try {
          const errorData = await clonedResponse.json() as ErrorResponse;
          console.error(`GET /api/posts/${params.slug}: Error response from worker:`, errorData);
          return NextResponse.json(
            { error: errorData.error || `Request failed with status: ${response.status}` },
            { status: response.status }
          );
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            console.error(`GET /api/posts/${params.slug}: Error response from worker (text):`, errorText);
            return NextResponse.json(
              { error: `Request failed with status: ${response.status}` },
              { status: response.status }
            );
          } catch (textError) {
            console.error(`GET /api/posts/${params.slug}: Could not read error response:`, textError);
            return NextResponse.json(
              { error: `Request failed with status: ${response.status}` },
              { status: response.status }
            );
          }
        }
      }
      
      // Return the successful response
      const data = await response.json();
      console.log(`GET /api/posts/${params.slug}: Successfully retrieved post`);
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error(`GET /api/posts/${params.slug}: Fetch error:`, fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to the Cloudflare Worker API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`GET /api/posts/${params.slug}: Unhandled server-side error:`, error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
} 