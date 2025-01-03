'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirebase } from '../../../contexts/FirebaseContext';
import { doc, getDoc, updateDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import type { Product } from '../../../types/product';
import Navbar from '../../components/Navbar';
import { User } from '../../../types/user';
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams();
  const { db } = useFirebase();
  const { currentUser } = useAuth();
  const router = useRouter(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [sellerData, setSellerData] = useState<User | null>(null);
  
  useEffect(() => {
    if (!id) {
      setError('Invalid product ID.');
      return;
    }

    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', Array.isArray(id) ? id[0] : id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          setProduct(productSnap.data() as Product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to fetch product.');
      }
    };

    fetchProduct();
  }, [db, id]);


  useEffect(() => {
    if (!currentUser) return;
  
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as User);
      }
    });
  
    return () => unsubscribe();
  }, [currentUser, db]);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!product?.sellerId) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', product.sellerId));
        if (userDoc.exists()) {
          setSellerData(userDoc.data() as User);
        }
      } catch (err) {
        console.error('Error fetching seller data:', err);
      }
    };

    fetchSellerData();
  }, [db, product?.sellerId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Loading...</p>;

  const handlePurchase = async () => {
    if (!product || !currentUser) return;

    try {
      // Don't allow purchase of already bought items
      if (product.is_bought) {
        setPurchaseStatus('This item has already been purchased.');
        return;
      }

      // Don't allow sellers to purchase their own items
      if (product.sellerId === currentUser.uid) {
        setPurchaseStatus('You cannot purchase your own item.');
        return;
      }

      const productRef = doc(db, 'products', id as string);
      await updateDoc(productRef, {
        is_bought: true,
        buyerId: currentUser.uid,
        buyerEmail: currentUser.email
      });

      if (userData?.wishlistedProducts?.includes(id as string)) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          wishlistedProducts: userData.wishlistedProducts.filter(pid => pid !== id)
        });
      }

      setProduct({
        ...product,
        is_bought: true
      });

      setPurchaseStatus('Purchase successful! The seller will contact you soon.');
    } catch (err) {
      console.error('Failed to purchase product:', err);
      setPurchaseStatus('Failed to complete purchase. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!product || !currentUser || product.sellerId !== currentUser.uid) return;
  
    try {
      const productRef = doc(db, 'products', id as string);
      await deleteDoc(productRef);
      router.push('/profile'); // Redirect to profile after deletion
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product.');
    }
  };
  
  const handleEdit = () => {
    router.push(`/create?edit=true&productId=${id}`);
  };

  const handleWishlist = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      // Initialize user document if it doesn't exist
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          wishlistedProducts: [id],
          email: currentUser.email,
          displayName: currentUser.displayName
        });
        setPurchaseStatus('Added to wishlist');
        return;
      }
      
      const userData = userDoc.data() as User;
      const wishlist = userData.wishlistedProducts || [];
      const isWishlisted = wishlist.includes(id as string);
      
      await updateDoc(userRef, {
        wishlistedProducts: isWishlisted
          ? wishlist.filter(productId => productId !== id)
          : [...wishlist, id]
      });
  
      setPurchaseStatus(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      setTimeout(() => setPurchaseStatus(''), 2000);
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      setError('Failed to update wishlist.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
              <Navbar />
      <img 
        src={product.imageUrl}
        height={300}
        width={300}
        alt={product.title}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold">{product.title}</h1>
      <p className="text-gray-600 mt-4">{product.description}</p>
      <p className="text-lg font-bold mt-4">
        Current Price: ${(product.currentPrice || 0).toFixed(2)}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Listed Price: ${(product.listedPrice || 0).toFixed(2)}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Minimum Price: ${(product.minimumPrice || 0).toFixed(2)}
      </p>
      <Link 
        href={`/profile/${product.sellerId}`} 
        className="text-sm text-gray-500 hover:text-gray-700 mt-2"
      >
        Posted by: {sellerData?.displayName || product.sellerEmail}
      </Link>
      {product && currentUser && (
        <div className="mt-6 space-y-4">
          {product.sellerId === currentUser.uid ? (
            // Show edit/delete buttons for product owner
            <div className="flex gap-4">
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Listing
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Listing
              </button>
            </div>
          ) : (
            // Show purchase and wishlist buttons for non-owners
            !product.is_bought && (
              <div className="flex gap-4">
                <button
                  onClick={handleWishlist}
                  className={`px-6 py-3 ${
                    userData?.wishlistedProducts?.includes(id as string)
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  } text-white rounded-lg transition-colors`}
                >
                  {userData?.wishlistedProducts?.includes(id as string) 
                    ? 'Remove from Wishlist' 
                    : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handlePurchase}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Purchase for ${(product.currentPrice || 0).toFixed(2)}
                </button>
              </div>
            )
          )}
        </div>
      )}

      {product?.is_bought && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          This item has been purchased
        </div>
      )}

      {product?.is_bought && product.sellerId === currentUser?.uid && (
        <div className="mt-6">
          <button
            onClick={async () => {
              try {
                const productRef = doc(db, 'products', id as string);
                await updateDoc(productRef, {
                  is_bought: false,
                  createdAt: Date.now(),
                  currentPrice: product.listedPrice // Reset to original price
                });
                router.push(`/create?edit=true&productId=${id}&relist=true`);
              } catch (err) {
                console.error('Failed to relist product:', err);
                setError('Failed to relist product.');
              }
            }}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Relist Item
          </button>
        </div>
      )}

      {purchaseStatus && (
        <div className="mt-4 p-4 rounded-lg text-center">
          {purchaseStatus}
        </div>
      )}
    </div>
  );
}
