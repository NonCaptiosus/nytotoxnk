'use client';

export const runtime = 'edge';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, error: authError, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  
  // Handle login form submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { username, password } = loginData;
    
    if (!username || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    const success = await login(username, password);
    
    if (success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(authError || 'Login failed');
    }
  };
  
  // Handle register form submission
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { username, password, confirmPassword, email } = registerData;
    
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const success = await register(username, password, email || undefined);
    
    if (success) {
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(authError || 'Registration failed');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 font-serif text-primary dark:text-text-dark text-center">
        Account Access
      </h1>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 text-center">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-center">
          {error}
        </div>
      )}
      
      <div className="flex justify-center mb-6">
        <div className="flex rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-6 py-2 font-medium ${
              activeTab === 'login'
                ? 'bg-primary text-white dark:bg-accent-dark dark:text-background-dark'
                : 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 font-medium ${
              activeTab === 'register'
                ? 'bg-primary text-white dark:bg-accent-dark dark:text-background-dark'
                : 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            Register
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Form */}
        <div className={`p-6 dark:bg-card-dark rounded-lg ${activeTab === 'login' ? 'block' : 'hidden md:block'}`}>
          <h2 className="text-2xl font-bold mb-4 font-serif text-primary dark:text-text-dark">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="login-username"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Username
              </label>
              <input
                type="text"
                id="login-username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
                required
              />
            </div>
            
            <div className="mb-6">
              <label
                htmlFor="login-password"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Password
              </label>
              <input
                type="password"
                id="login-password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-accent-dark dark:text-background-dark dark:hover:bg-accent-dark/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        
        {/* Register Form */}
        <div className={`p-6 dark:bg-card-dark rounded-lg ${activeTab === 'register' ? 'block' : 'hidden md:block'}`}>
          <h2 className="text-2xl font-bold mb-4 font-serif text-primary dark:text-text-dark">Create Account</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label
                htmlFor="register-username"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Username
              </label>
              <input
                type="text"
                id="register-username"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
                required
              />
              <p className="mt-1 text-sm text-secondary dark:text-accent-dark">
                Minimum 3 characters
              </p>
            </div>
            
            <div className="mb-4">
              <label
                htmlFor="register-email"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Email (optional)
              </label>
              <input
                type="email"
                id="register-email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            
            <div className="mb-4">
              <label
                htmlFor="register-password"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Password
              </label>
              <input
                type="password"
                id="register-password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
                required
              />
              <p className="mt-1 text-sm text-secondary dark:text-accent-dark">
                Minimum 6 characters
              </p>
            </div>
            
            <div className="mb-6">
              <label
                htmlFor="register-confirm-password"
                className="block mb-2 font-medium text-primary dark:text-text-dark"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="register-confirm-password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent-dark dark:border-neutral-700 dark:bg-neutral-800"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-accent-dark dark:text-background-dark dark:hover:bg-accent-dark/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="text-center mt-6 text-secondary dark:text-accent-dark">
        <Link href="/" className="text-primary hover:underline dark:text-accent-dark">
          Return to Home
        </Link>
      </div>
    </div>
  );
} 