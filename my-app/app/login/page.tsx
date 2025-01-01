'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signIn, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setFormError('Both fields are required.');
      return;
    }

    setFormError('');
    try {
      await signIn(email, password);
      router.push('/products'); // Redirect after successful login
    } catch (err) {
      console.error(err); // Handled by AuthContext error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 mt-1 border rounded"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 mt-1 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        {formError && <p className="mt-4 text-red-500">{formError}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <p className="mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
