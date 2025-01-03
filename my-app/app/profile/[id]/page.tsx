'use client';

import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import UserProfile from '../../components/UserProfile';

export default function UserProfilePage() {
  const { id } = useParams();

  return (
    <div className="max-w-[900px] m-auto max-h-screen">
      <Navbar />
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <UserProfile userId={id as string} />
      </main>
    </div>
  );
}