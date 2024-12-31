'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';

export default function Products() {
  const { currentUser } = useAuth(); // Access global auth session
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login'); // Redirect to login if no session exists
    }
  }, [currentUser, router]);

  // Prevent rendering the page while redirecting
  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-[900px] m-auto max-h-screen">
      <Navbar />
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold">PRODUCT LIST</h1>
        <p>nab the best deals from your block</p>
        <ProductList />
      </main>
    </div>
  );
}
