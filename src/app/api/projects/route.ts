import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const runtime = 'edge';

export async function GET() {
  try {
    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to get all projects
    const response = await fetch(`${apiUrl}/projects`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch projects: ${response.status}` },
        { status: response.status }
      );
    }

    const projects = await response.json();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json() as { 
      title: string; 
      description: string; 
      content?: string; 
      imageUrl?: string;
      repoUrl?: string;
      demoUrl?: string;
      technologies?: string[];
      slug: string;
    };

    // Simple validation
    if (!data.title || !data.description || !data.slug) {
      return NextResponse.json(
        { error: 'Title, description, and slug are required' },
        { status: 400 }
      );
    }

    // Convert to CF Workers API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworker.aldo.workers.dev';
    
    // Send request to create the project
    const response = await fetch(`${apiUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return NextResponse.json(
        { error: errorData.message || `Failed to create project: ${response.status}` },
        { status: response.status }
      );
    }

    const createdProject = await response.json();
    return NextResponse.json(createdProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 