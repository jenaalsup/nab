'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function Navbar() {
    const { currentUser } = useAuth();

  return (
    <nav className="py-4">
      <div className="container mx-auto flex justify-between items-center">

      <Link href="/products">

        <h1 className="text-xl font-bold">nab</h1>
        </Link>

          <div className="flex items-center gap-4">

            <Link href="/profile">{currentUser?.email}</Link>
          </div>

      </div>
    </nav>
  );
}
