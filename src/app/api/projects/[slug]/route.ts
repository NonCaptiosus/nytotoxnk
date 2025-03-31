import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to get the project
    const response = await fetch(`${apiUrl}/projects/${slug}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch project: ${response.status}` },
        { status: response.status }
      );
    }

    const project = await response.json();
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const data = await request.json() as { 
      title: string; 
      description: string; 
      content: string; 
      imageUrl?: string;
      repoUrl?: string;
      demoUrl?: string;
      technologies?: string[];
    };

    // Simple validation
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to update the project
    const response = await fetch(`${apiUrl}/projects/${slug}`, {
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
        { error: errorData.message || `Failed to update project: ${response.status}` },
        { status: response.status }
      );
    }

    const updatedProject = await response.json();
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
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

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to delete the project
    const response = await fetch(`${apiUrl}/projects/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete project' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 