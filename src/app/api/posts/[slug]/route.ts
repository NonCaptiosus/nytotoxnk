import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { FALLBACK_POSTS } from '@/lib/data';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = params;
    const data = await request.json() as { title: string; content: string; author?: string; tags?: string[] };

    // Simple validation
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to update the post
    const response = await fetch(`${apiUrl}/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return NextResponse.json(
        { error: errorData.message || 'Failed to update post' },
        { status: response.status }
      );
    }

    const updatedPost = await response.json();
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Prevent deletion of fallback posts in development
    if (process.env.NODE_ENV === 'development') {
      const isFallbackPost = FALLBACK_POSTS.some((post: { slug: string }) => post.slug === slug);
      if (isFallbackPost) {
        return NextResponse.json(
          { error: 'Cannot delete fallback posts in development mode' },
          { status: 403 }
        );
      }
    }

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to delete the post
    const response = await fetch(`${apiUrl}/posts/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete post' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 