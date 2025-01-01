'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';

const OnboardingPage = () => {
  const { currentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const availableInterests = ['Furniture', 'Clothing', 'Books', 'Homewares'];

  //const { displayName, email } = currentUser;
  const displayName = currentUser?.displayName ?? '';
  const email = currentUser?.email ?? '';
  
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

      // Update Firebase profile with name and bio
      await updateProfile(currentUser, {
        photoURL: profilePicture ? URL.createObjectURL(profilePicture) : undefined,
        displayName: currentUser.displayName,
      });

      // Save additional details like bio, location, and interests to your database
      // This requires implementing a Firestore or Realtime Database integration.

      router.push('/products');
    } catch (err) {
      console.error(err);
      setError('Failed to complete onboarding. Please try again.');
    }
  };

  if (!currentUser) {return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
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
            Complete Profile
          </button>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};
};

export default OnboardingPage;
