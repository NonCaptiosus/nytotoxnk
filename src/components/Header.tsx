"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold hover:text-gray-200">
            Aldo Diku
          </Link>

          {/* Desktop Navigation */}
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/" 
                  className={`hover:text-gray-200 ${isActive('/') ? 'font-semibold border-b-2 border-white pb-1' : ''}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/blogs" 
                  className={`hover:text-gray-200 ${isActive('/blogs') ? 'font-semibold border-b-2 border-white pb-1' : ''}`}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/projects" 
                  className={`hover:text-gray-200 ${isActive('/projects') ? 'font-semibold border-b-2 border-white pb-1' : ''}`}
                >
                  Projects
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
} 