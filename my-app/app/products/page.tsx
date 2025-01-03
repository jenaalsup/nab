'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';
import Link from 'next/link';

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
    <div>

      <div className="max-w-[900px] m-auto max-h-screen px-4">
        <Navbar />
        <div className="flex flex-row justify-between items-center py-6">
          <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-2">deals from your block</h1>
          <p className="text-gray-500">Prices drop dynamically every day! Check back in to nab the best deals.</p>
          </div>

          <Link href="/create">
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-200">
              Add Listing
            </button>
          </Link>
        </div>
      </div>

      <ProductList />

    </div>
  );
}
