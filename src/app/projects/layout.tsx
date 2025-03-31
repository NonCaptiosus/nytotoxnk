import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Check out my web development and cloud projects',
};

export const runtime = 'edge';

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
} 