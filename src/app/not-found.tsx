import Link from 'next/link';

export const runtime = 'edge';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-6xl font-bold mb-4 text-primary dark:text-text-dark font-serif">404</h1>
      <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-text-dark font-serif">Page Not Found</h2>
      <p className="text-secondary dark:text-accent-dark mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      <Link 
        href="/" 
        className="bg-primary text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors dark:bg-accent-dark dark:text-background-dark"
      >
        Return Home
      </Link>
    </div>
  );
} 