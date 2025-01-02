'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirebase } from '../../../contexts/FirebaseContext';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import type { Product } from '../../../types/product';
import Navbar from '../../components/Navbar';

export default function ProductPage() {
  const { id } = useParams();
  const { db } = useFirebase();
  const { currentUser } = useAuth();
  const router = useRouter(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid product ID.');
      return;
    }

    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', Array.isArray(id) ? id[0] : id);        const productSnap = await getDoc(productRef);

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
      <p className="text-sm text-gray-500 mt-2">
        Posted by: {product.sellerEmail}
      </p>
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
            // Show purchase button for non-owners
            !product.is_bought && (
              <button
                onClick={handlePurchase}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Purchase for ${(product.currentPrice || 0).toFixed(2)}
              </button>
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
