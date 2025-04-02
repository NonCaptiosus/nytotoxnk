"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '@/lib/authContext';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="border-b border-gray-100 dark:border-neutral-800 sticky top-0 z-50 bg-background dark:bg-background-dark">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary hover:text-secondary dark:text-text-dark dark:hover:text-accent-dark font-serif" onClick={closeMobileMenu}>
            nytotoxNK
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-6">
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
                <li>
                  <Link 
                    href="/about" 
                    className={`hover:text-secondary dark:hover:text-accent-dark ${isActive('/about') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                  >
                    About Me
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link 
                      href="/create-post" 
                      className={`hover:text-secondary dark:hover:text-accent-dark ${isActive('/create-post') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                    >
                      New Post
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="border-l border-gray-200 dark:border-neutral-700 pl-6 flex items-center space-x-4">
              <ThemeSwitcher />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-secondary dark:text-accent-dark">
                    {user?.username}
                  </span>
                  <button 
                    onClick={logout} 
                    className="text-sm text-primary hover:text-secondary dark:text-accent-dark dark:hover:text-text-dark"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth" 
                  className={`text-sm hover:text-secondary dark:hover:text-accent-dark ${isActive('/auth') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button (Visible on Mobile) */}
          <div className="md:hidden flex items-center">
             <ThemeSwitcher />
             <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-4 p-2 rounded-md text-primary dark:text-text-dark hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

       {/* Mobile Navigation Menu (Overlay) */}
       <div
        className={`md:hidden absolute top-full left-0 w-full bg-background dark:bg-background-dark border-b border-gray-100 dark:border-neutral-800 shadow-md transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <nav className="px-4 pt-4 pb-6">
          <ul className="flex flex-col space-y-4">
             <li>
              <Link
                href="/"
                className={`block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/blogs"
                className={`block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/blogs') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                 onClick={closeMobileMenu}
             >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className={`block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/projects') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                 onClick={closeMobileMenu}
             >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={`block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/about') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                 onClick={closeMobileMenu}
             >
                About Me
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link
                  href="/create-post"
                  className={`block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/create-post') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                   onClick={closeMobileMenu}
               >
                  New Post
                </Link>
              </li>
            )}
          </ul>
           <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
            {isAuthenticated ? (
              <div className="flex flex-col items-start space-y-3">
                 <span className="text-sm text-secondary dark:text-accent-dark px-3">
                  Logged in as: {user?.username}
                </span>
                <button
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="w-full text-left py-2 px-3 rounded text-sm text-primary hover:bg-gray-100 dark:text-accent-dark dark:hover:bg-neutral-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className={`block py-2 px-3 rounded text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 ${isActive('/auth') ? 'text-primary font-semibold dark:text-text-dark' : 'text-secondary dark:text-accent-dark'}`}
                 onClick={closeMobileMenu}
             >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
} 