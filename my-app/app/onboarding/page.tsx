'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import type { User } from '../../types/user';

const OnboardingPage = () => {
  const { currentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const availableInterests = ['Furniture', 'Clothing', 'Books', 'Homewares'];
  const displayName = currentUser?.displayName ?? '';
  const email = currentUser?.email ?? '';
  const { db } = useFirebase();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  
  // Add this effect to load existing data
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser || !isEditing) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || '');
          setLocation(userData.location || '');
          setInterests(userData.interests || []);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      }
    };

    loadUserData();
  }, [currentUser, db, isEditing]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleCheckboxChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!currentUser) {
      setError('No user is logged in.');
      return;
    }
  
    try {
      setError(null);
  
      let photoURL = currentUser.photoURL;
  
      // Upload new profile picture if one was selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('file', profilePicture);
        formData.append('upload_preset', 'listings');
  
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dxzkav00b/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        photoURL = data.secure_url;
      }
  
      // Update Firebase profile
      await updateProfile(currentUser, {
        photoURL,
        displayName: currentUser.displayName,
      });
  
      const userData: Partial<User> = {
        id: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL,
        bio,
        location,
        interests,
        updatedAt: Date.now(),
      };
  
      if (!isEditing) {
        userData.createdAt = Date.now();
      }
  
      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      router.push('/profile');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    }
  };

 return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
        </h1>
        <label className="block text-sm font-medium text-gray-700">Name</label>

        <p className="pb-4">{displayName}</p>
        <label className="block text-sm font-medium text-gray-700">Email</label>

        <p className="pb-4">{email}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full p-2 mt-1 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Your city or region"
              className="w-full p-2 mt-1 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Interests</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableInterests.map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleCheckboxChange(interest)}
                    className="mr-2"
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            {isEditing ? 'Update Profile' : 'Complete Profile'}
          </button>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </form>
      </div>
    </div>
 )
}
export default OnboardingPage;
