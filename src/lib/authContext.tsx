'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBaseUrl } from './api';

// User interface
interface User {
  username: string;
  token: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth response from the API
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data: AuthResponse = await response.json();

      if (!data.success || !data.token || !data.username) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }

      const userData: User = {
        username: data.username,
        token: data.token
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return true;
    } catch (e) {
      console.error('Login error:', e);
      setError('Failed to connect to the authentication service');
      setLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (username: string, password: string, email?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
      });

      const data: AuthResponse = await response.json();

      if (!data.success || !data.token || !data.username) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return false;
      }

      const userData: User = {
        username: data.username,
        token: data.token
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return true;
    } catch (e) {
      console.error('Registration error:', e);
      setError('Failed to connect to the authentication service');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook to check if user is authenticated
export function useRequireAuth(redirectUrl = '/auth') {
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, loading, redirectUrl]);

  return { isReady };
} 