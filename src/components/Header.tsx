"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="border-b border-gray-100 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary hover:text-secondary dark:text-text-dark dark:hover:text-accent-dark font-serif">
            nytotoxNK
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-6 font-medium">
                <li>
                  <Link 
                    href="/" 
                    className={`hover:text-secondary dark:hover:text-accent-dark ${isActive('/') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blogs" 
                    className={`hover:text-secondary dark:hover:text-accent-dark ${isActive('/blogs') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects" 
                    className={`hover:text-secondary dark:hover:text-accent-dark ${isActive('/projects') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                  >
                    Projects
                  </Link>
                </li>
              </ul>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 