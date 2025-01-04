'use client';

import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
    const { currentUser } = useAuth();

  return (
    <nav className="py-6 px-4 m-2">
      <div className="container mx-auto flex justify-between items-center">

      <Link href="/products">

        <h1 className="text-xl font-bold"><img src="/nab.svg" alt="nab" className="w-[60px] h-auto" /></h1>
        </Link>

          <div className="flex items-center gap-2">
          <img
              src={currentUser?.photoURL || "/images/default-profile.png"} // Fallback to a default image if photoURL is not set
              alt="Profile"
              className="rounded-full w-6 h-6 object-cover"
            />
            <Link href="/profile" className="text-gray-500">{currentUser?.displayName}</Link>
          </div>

      </div>
    </nav>
  );
}
