'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';

const UserProfile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No user is logged in.</p>
      </div>
    );
  }

  const { displayName, email } = currentUser;

  return (
    <div className="">
        <div className="space-y-4">
          <Image src="/images/profile.png" alt="profile" width={100} height={100} />
          <h1 className="text-2xl font-bold p-2">{displayName}</h1>
            <p className="p-2">{email}</p>
          </div>
      </div>
  );
};

export default UserProfile;
