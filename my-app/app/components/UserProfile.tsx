'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/types/user';
import { useRouter } from 'next/navigation';

const UserProfile = () => {
  const { currentUser, signOutUser } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };


  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No user is logged in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleEditProfile = () => {
    router.push('/onboarding?edit=true');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <img 
          src={userData?.photoURL || currentUser?.photoURL || "/images/profile.png"} 
          alt="profile" 
          width={100} 
          height={100} 
          className="rounded-full"
        />
        <button
          onClick={handleEditProfile}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Edit Profile
        </button>
      </div>
      <h1 className="text-2xl font-bold p-2">{userData?.displayName || currentUser.displayName}</h1>
      <p className="p-2">{userData?.email || currentUser.email}</p>
      
      {userData?.bio && (
        <div className="p-2">
          <h2 className="font-semibold">Bio</h2>
          <p>{userData.bio}</p>
        </div>
      )}
      
      {userData?.location && (
        <div className="p-2">
          <h2 className="font-semibold">Location</h2>
          <p>{userData.location}</p>
        </div>
      )}
      
      {userData?.interests && userData.interests.length > 0 && (
        <div className="p-2">
          <h2 className="font-semibold">Interests</h2>
          <ul className="list-disc list-inside">
            {userData.interests.map((interest: string) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </div>
      )}

      {userData?.communities && userData.communities.length > 0 && (
        <div className="p-2">
          <h2 className="font-semibold">Communities</h2>
          <ul className="list-disc list-inside">
            {userData.communities.map((community: string) => (
              <li key={community}>{community}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Sign Out</button>
    </div>
  );
};

export default UserProfile;