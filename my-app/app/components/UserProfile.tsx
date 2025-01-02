'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';

const UserProfile = () => {
  const { currentUser, signOutUser } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'active' | 'sold' | 'purchases'>('profile');
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  // fetch user data
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

  // fetch user products
  useEffect(() => {
    if (!currentUser) return;
  
    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setUserProducts(products);
    });
  
    return () => unsubscribe();
  }, [currentUser, db]);

  // fetch purchased products
  useEffect(() => {
    if (!currentUser) return;
  
    const q = query(
      collection(db, 'products'),
      where('buyerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setPurchasedProducts(products);
    });
  
    return () => unsubscribe();
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

  const activeListings = userProducts.filter(product => !product.is_bought);
  const soldListings = userProducts.filter(product => product.is_bought);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Profile Header - Always Visible */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
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
  
        <h1 className="text-2xl font-bold">{userData?.displayName || currentUser.displayName}</h1>
        <p className="text-gray-600">{userData?.email || currentUser.email}</p>
        
        {userData?.bio && (
          <div className="mt-4">
            <h2 className="font-semibold">Bio</h2>
            <p>{userData.bio}</p>
          </div>
        )}
        
        {userData?.location && (
          <div className="mt-4">
            <h2 className="font-semibold">Location</h2>
            <p>{userData.location}</p>
          </div>
        )}
        
        {userData?.interests && userData.interests.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold">Interests</h2>
            <ul className="list-disc list-inside">
              {userData.interests.map((interest: string) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </div>
        )}
  
        {userData?.communities && userData.communities.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold">Communities</h2>
            <ul className="list-disc list-inside">
              {userData.communities.map((community: string) => (
                <li key={community}>{community}</li>
              ))}
            </ul>
          </div>
        )}
  
        <button onClick={handleSignOut} className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sign Out
        </button>
      </div>
  
      {/* Tabs */}
      <div className="mt-8 border-t pt-6">
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 ${activeTab === 'active' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Listings ({activeListings.length})
          </button>
          <button
            className={`px-6 py-3 ${activeTab === 'sold' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sold')}
          >
            Archive ({soldListings.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded ${
              activeTab === 'purchases' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Purchases ({purchasedProducts.length})
          </button>
        </div>
  
        {/* Tab Content */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeListings.length > 0 ? (
              activeListings.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center">No active listings</p>
            )}
          </div>
        )}
  
        {activeTab === 'sold' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {soldListings.length > 0 ? (
              soldListings.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center">No sold items</p>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {purchasedProducts.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">
                You haven't purchased any items yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;