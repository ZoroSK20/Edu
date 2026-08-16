'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // NextAuth automatically appends a callbackUrl when it redirects unauthenticated users
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Use NextAuth's signIn method for the credentials provider
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    } else {
      // On success, push them to the page they were originally trying to access
      router.push(callbackUrl);
      router.refresh(); // Force a router refresh to sync Server Components with the new session
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="jane.doe@portal.edu"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Authenticating...' : 'Sign In'}
      </Button>

      {/* Helper text since this is a demo environment */}
      <div className="pt-4 border-t border-gray-100 mt-6 text-center space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demo Accounts</p>
        <p className="text-xs text-gray-600">Teacher: <span className="font-mono bg-gray-100 px-1 rounded">prof.smith@portal.edu</span> / password123</p>
        <p className="text-xs text-gray-600">Student: <span className="font-mono bg-gray-100 px-1 rounded">jane.doe@portal.edu</span> / password123</p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Education Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your dashboard and AI insights.
          </p>
        </div>

        <Card className="p-8 shadow-xl border-gray-200">
          {/* Suspense boundary is required by Next.js when using useSearchParams() */}
          <Suspense fallback={<div className="text-center text-sm text-gray-500 py-4">Loading secure login...</div>}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
