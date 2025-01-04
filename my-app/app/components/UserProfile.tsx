'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';
import Link from 'next/link';

const UserProfile = ({ userId = null }: { userId?: string | null }) => {
  const { currentUser, signOutUser } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'active' | 'sold' | 'purchases' | 'wishlist'>('active');
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const targetUserId = userId || currentUser?.uid;
  const isOwnProfile = !userId || userId === currentUser?.uid;

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  // fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }
  
      try {
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
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
  }, [db, targetUserId]);

  // fetch user products
  useEffect(() => {
    if (!targetUserId) return;
  
    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', targetUserId),
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
  }, [db, targetUserId]);

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

  useEffect(() => {
    if (!currentUser || !userData?.wishlistedProducts?.length) {
      setWishlistProducts([]);
      return;
    }
  
    const fetchWishlistedProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('__name__', 'in', userData.wishlistedProducts)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          setWishlistProducts(products);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
  
    fetchWishlistedProducts();
  }, [currentUser, userData?.wishlistedProducts, db]);

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
    {/* Profile Header */}
    <div className="flex flex-col items-center mb-4">
      {/* Profile Picture */}
      <img
        src={userData?.photoURL || currentUser?.photoURL || "/images/profile.png"}
        alt="profile"
        className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover"
      />

      {/* Name & Email */}
      <h1 className="text-xl md:text-2xl font-bold mt-4 text-center">
        {userData?.displayName || currentUser.displayName}
      </h1>
      <p className="text-gray-600 mt-2 text-md md:text-base">
        {userData?.email || currentUser.email}
      </p>

      {/* Optional Bio */}
      {userData?.bio && (
        <p className="mt-4 text-center max-w-lg text-gray-700 mb-2">
          {userData.bio}
        </p>

      )}
  </div>

{/* Additional Info */}
<div className="flex flex-row items-center justify-center gap-2 mb-6 text-gray-800">
  {/* Location */}
  {userData?.location && (
    <div className="flex items-center gap-2">
      <span className="text-sm"> </span>
      <span className="">{userData.location}</span>
    </div>
  )}
  <span className="">•</span>
  {/* Interests */}
  {userData?.interests && userData.interests.length > 0 && (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {userData.interests.map((interest) => (
          <span
            key={interest}
            className="px-2 py-1 bg-gray-100 rounded-full text-gray-600"
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  )}
    <span className="">•</span>
    {/* Communities */}
    {userData?.communities && userData.communities.length > 0 && (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {userData.communities.map((community) => (
          <span
            key={community}
            className="px-2 py-1 text-underline text-gray-600"
          >
            {community}
          </span>
        ))}
      </div>
    </div>
  )}
</div>

  {isOwnProfile && (
    <div className="mt-4 flex flex-row md:flex-row items-center justify-center mb-8 gap-4">
      <button
        onClick={handleEditProfile}
        className="px-4 text-sm py-2 border border-gray-300 rounded hover:bg-gray-200"
      >
        Edit Profile
      </button>
      <button
        onClick={handleSignOut}
        className="px-4 text-sm py-2 border border-gray-300 rounded hover:bg-gray-200"
      >
        Sign Out
      </button>
    </div>
  )}


    {/* Tabs Section */}
    <div className="border-t pt-6">
      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <button
          className={`px-6 py-3 ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Listings ({activeListings.length})
        </button>
        <button
          className={`px-6 py-3 ${
            activeTab === 'sold'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('sold')}
        >
          Archive ({soldListings.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-3 ${
            activeTab === 'purchases'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
        >
          Purchases ({purchasedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-6 py-3 ${
            activeTab === 'wishlist'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
        >
          Wishlist ({wishlistProducts.length})
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeListings.length > 0 ? (
            activeListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-2 text-gray-500 text-center mt-12">
              No active listings
            </p>
          )}

          {/* Centered Add Listing Button - Only show for own profile */}
          {isOwnProfile && (
            <div className="col-span-full flex justify-center">
              <Link
                href="/create"
                className="px-4 py-2 border text-sm border-gray-300 rounded hover:bg-gray-200"
              >
                Add Listing
              </Link>
            </div>
          )}
        </div>
      )}



      {activeTab === 'sold' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {soldListings.length > 0 ? (
            soldListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center mt-12">No sold items</p>
          )}

          
        {/* Centered Add Listing Button */}
        <div className="col-span-full flex justify-center">
          <Link
            href="/create"
            className="px-4 py-2 border text-sm border-gray-300 rounded hover:bg-gray-200"
          >
            Add Listing
          </Link>
        </div>
 
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {purchasedProducts.length === 0 && (
            <p className="text-gray-500 col-span-full text-center mt-12">
              You have not purchased any items yet.
            </p>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {wishlistProducts.length === 0 && (
            <p className="text-gray-500 col-span-full text-center mt-12">
              Your wishlist is empty.
            </p>
          )}
        </div>
      )}
    </div>
  </div>
);



};

export default UserProfile;