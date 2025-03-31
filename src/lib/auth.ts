'use client';

import { useEffect, useState } from 'react';
import { cookies } from 'next/headers';
import { useAuth } from './authContext';

export interface Session {
  user: {
    name: string;
    email: string;
    token: string;
  };
}

// Client-side getSession
export const getClientSession = async (): Promise<Session | null> => {
  // For client components, use the useAuth hook context
  const auth = useAuth();
  if (!auth.isAuthenticated) return null;
  
  return {
    user: {
      name: auth.user?.username || 'Admin',
      email: 'admin@example.com', // User type doesn't have email, use a default
      token: auth.user?.token || ''
    }
  };
};

// Server-side getSession
export const getSession = async (): Promise<Session | null> => {
  try {
    // For server components, use cookies
    if (typeof window === 'undefined') {
      const cookieStore = cookies();
      const token = cookieStore.get('auth-token')?.value;
      
      if (!token) return null;
      
      return {
        user: {
          name: 'Admin', // Default values since we don't store these in cookies
          email: 'admin@example.com',
          token
        }
      };
    } else {
      // For client components, fallback to localStorage
      const token = localStorage.getItem('auth-token');
      
      if (!token) return null;
      
      return {
        user: {
          name: 'Admin',
          email: 'admin@example.com',
          token
        }
      };
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}; 