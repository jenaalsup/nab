'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';


export default function SignUpPage() {
  const { signUp, signIn, error, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!name || !email || !password || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
  
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
  
    setFormError('');
    try {
      const user = await signUp(email, password);
  
      // Update profile using updateProfile from Firebase Auth
      await updateProfile(user, {
        displayName: name,
      });
  
      alert('Sign-up successful! A verification email has been sent to your email address. Please verify your email to log in.');
      await signIn(email, password);
  
      router.push('/onboarding'); // Redirect after successful sign up
    } catch (err) {
      console.error(err);
      setFormError('Failed to sign up. Please try again.');
    }
  };
  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-12 bg-white rounded border">
      <img src="./bunnycat.png" alt="hero" className="w-[80px] h-auto m-auto pb-8" />

        <h1 className="text-2xl font-bold text-center mb-6">sign up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full p-2 mt-1 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        {formError && <p className="mt-4 text-red-500">{formError}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <p className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
