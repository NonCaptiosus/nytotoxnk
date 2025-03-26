import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Define the expected request body type
interface CreatePostRequest {
  post: {
    title: string;
    slug: string;
    content: string;
    [key: string]: any;
  };
  token: string;
}

// Define response interfaces
interface WorkerErrorResponse {
  error: string;
  [key: string]: any;
}

interface WorkerSuccessResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/create-post: Request received');
    
    // Parse the incoming request body
    let body;
    try {
      body = await request.json() as CreatePostRequest;
      console.log('POST /api/create-post: Request body parsed successfully');
    } catch (parseError) {
      console.error('POST /api/create-post: Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { post, token } = body;

    // Validate request data
    if (!post || !post.title || !post.slug || !post.content) {
      const missingFields = [];
      if (!post) missingFields.push('post object');
      else {
        if (!post.title) missingFields.push('title');
        if (!post.slug) missingFields.push('slug');
        if (!post.content) missingFields.push('content');
      }
      
      console.error(`POST /api/create-post: Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { error: `Invalid post data. Missing: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    if (!token) {
      console.error('POST /api/create-post: Missing authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Get the Cloudflare Worker URL
    // Use local worker when in development
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787';
    console.log(`POST /api/create-post: Using worker URL: ${workerUrl}`);

    // Create a simplified post object to send to the worker
    // This matches the expected format in the worker
    const simplifiedPost = {
      title: post.title,
      slug: post.slug,
      content: post.content.slice(0, 100000) // Limit content length to prevent issues
    };

    console.log('POST /api/create-post: Sending to worker with data:', {
      title: simplifiedPost.title,
      slug: simplifiedPost.slug,
      contentLength: simplifiedPost.content.length
    });

    // Forward the request to the Cloudflare Worker
    try {
      const response = await fetch(`${workerUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplifiedPost),
        redirect: 'follow',
        cache: 'no-cache', // Ensure we're not getting cached responses
      });

      // Check if the request was successful
      console.log(`POST /api/create-post: Worker responded with status ${response.status}`);
      
      if (!response.ok) {
        // For 500 errors, create a generic server error message
        if (response.status >= 500) {
          console.error(`Server error: ${response.status} from Cloudflare Worker`);
          return NextResponse.json(
            { error: 'The server encountered an error while processing your request' },
            { status: 500 }
          );
        }
        
        // For non-500 errors, try to get more details
        // Clone the response before reading it to avoid the "Body already read" error
        const clonedResponse = response.clone();
        
        // Try to read as JSON first
        try {
          const errorData = await clonedResponse.json() as WorkerErrorResponse;
          console.error('Server-side: Error response from worker (JSON):', errorData);
          return NextResponse.json(
            { error: errorData.error || `Request failed with status: ${response.status}` },
            { status: response.status }
          );
        } catch (jsonError) {
          // If not JSON, try to get text from the original response
          console.error('Error parsing JSON response:', jsonError);
          try {
            const errorText = await response.text();
            console.error('Server-side: Error response from worker (Text):', errorText);
            
            // Try to parse the Cloudflare error page to extract more meaningful information
            if (errorText.includes('Worker threw exception')) {
              console.error('Worker threw an exception while processing the request');
              return NextResponse.json(
                { error: 'The Cloudflare Worker encountered an error while processing your request.' },
                { status: 500 }
              );
            }
            
            return NextResponse.json(
              { error: `Request failed with status: ${response.status} - ${errorText.substring(0, 200)}` },
              { status: response.status }
            );
          } catch (textError) {
            console.error('Could not read error response:', textError);
            return NextResponse.json(
              { error: `Request failed with status: ${response.status}` },
              { status: response.status }
            );
          }
        }
      }

      // Return the successful response
      // Clone the response before reading it
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json() as WorkerSuccessResponse;
        console.log('POST /api/create-post: Successfully created post with ID:', data.id);
        return NextResponse.json(data);
      } catch (jsonError) {
        console.error('POST /api/create-post: Error parsing success response:', jsonError);
        
        // If we can't parse the JSON, try to read the text to see what's there
        try {
          const responseText = await response.text();
          console.error('Raw response text:', responseText);
        } catch (textError) {
          console.error('Could not read response text either:', textError);
        }
        
        return NextResponse.json(
          { error: 'Received invalid response from worker' },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error('POST /api/create-post: Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to connect to the Cloudflare Worker API',
          details: fetchError instanceof Error ? fetchError.message : String(fetchError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('POST /api/create-post: Unhandled server-side error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected server error occurred',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}