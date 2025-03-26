import { NextResponse } from 'next/server';

// A simple test endpoint that doesn't connect to any external services
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Next.js API is running' });
}

// Test connection to the worker
export async function POST() {
  try {
    // Get the Cloudflare Worker URL
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:8787';
    console.log(`Testing connection to worker at: ${workerUrl}`);
    
    // Try to connect to the worker
    const response = await fetch(`${workerUrl}/api/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });
    
    // Check response
    if (!response.ok) {
      return NextResponse.json({ 
        status: 'Worker connection failed', 
        error: `Status: ${response.status}` 
      }, { status: 500 });
    }
    
    // Return success
    return NextResponse.json({ 
      status: 'Connected to worker successfully',
      workerUrl
    });
  } catch (error) {
    console.error('Worker connection test failed:', error);
    return NextResponse.json({ 
      status: 'Worker connection failed', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 