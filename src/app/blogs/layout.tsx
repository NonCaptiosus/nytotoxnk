import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'Read all my blog posts about web development and technology',
};

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return children;
} 