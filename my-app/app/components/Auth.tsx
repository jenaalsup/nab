'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const router = useRouter();
  const { auth } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Redirect to /products if user is signed in
        router.push('/products');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if email ends with .edu
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Only .edu email addresses are allowed to sign up.');
      setStatus('');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setStatus('Verification email sent! Please check your inbox.');
      setError('');
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Error updating price:', error.message);
      } else {
        console.error('Unknown error updating price:', error);
      }
      setStatus('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('Successfully signed in!');
      setError('');
      router.push('/products'); // Redirect to products page after successful sign in
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Error updating price:', error.message);
      } else {
        console.error('Unknown error updating price:', error);
      }
      setStatus('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setStatus('Successfully signed out!');
      setError('');
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Error updating price:', error.message);
      } else {
        console.error('Unknown error updating price:', error);
      }
      setStatus('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {currentUser ? (
        <div className="mb-4 text-center">
          <p>Signed in as: {currentUser.email}</p>
          <p className="text-sm">
            Email verified: {currentUser.emailVerified ? '✅' : '❌'}
          </p>
        </div>
      ) : (
        <p className="mb-4 text-center">Not signed in</p>
      )}

      <form className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-4">
          <button
            onClick={handleSignUp}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign In
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {status && <p className="mt-4 text-green-500">{status}</p>}
    </div>
  );
}
