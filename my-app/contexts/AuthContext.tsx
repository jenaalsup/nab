'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useFirebase } from './FirebaseContext';

type AuthContextType = {
    currentUser: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<User>; // Update return type to Promise<User>
    signOutUser: () => Promise<void>;
    loading: boolean;
    error: string | null;
  };
  

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useFirebase();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Sign In function
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out function
  const signOutUser = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Sign Up function
  const signUp = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      // Send email verification
      await sendEmailVerification(userCredential.user);
  
      return userCredential.user; // Always return the User object on success
    } catch (err: any) {
      setError(err.message);
      throw new Error(err.message); // Explicitly throw an error to avoid returning undefined
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AuthContext.Provider value={{ currentUser, signIn, signUp, signOutUser, loading, error }}>
    {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>

  );
};
