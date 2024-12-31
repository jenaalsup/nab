'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
export default function Navbar() {
    const router = useRouter();
  const { currentUser, signOutUser, loading } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">nab</h1>

          <div className="flex items-center gap-4">
            <span>{currentUser?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>

      </div>
    </nav>
  );
}
