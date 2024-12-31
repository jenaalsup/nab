'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { Product } from '../../types/product';

export default function CreateProductForm() {
  const { db, auth } = useFirebase();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  if (!currentUser) {
    return (
      <div className="text-center">
        <p className="text-xl mb-4">Please sign in to create a listing</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go back home
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !imageUrl) {
      setStatus('Please fill in all fields');
      return;
    }

    setStatus('Creating listing...');

    try {
      const productData: Omit<Product, 'id'> = {
        title,
        description,
        price: parseFloat(price),
        imageUrl,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email!,
        createdAt: Date.now()
      };
  
      console.log('About to add doc:', productData);

      if (!db) {
        console.log('firestore not initialized');
        //throw new Error('Firestore instance is not initialized');
      }
      else {
        console.log('firestore initialized');
      }

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log('Document written with ID: ', docRef.id);
      setStatus('Product created successfully!');
      
      // Add a small delay before redirect
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating product:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you selling?"
            className="w-full p-3 border rounded-lg text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item (condition, age, etc.)"
            className="w-full p-3 border rounded-lg text-black min-h-[150px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-3 border rounded-lg text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 border rounded-lg text-black"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          List Item for Sale
        </button>
      </form>

      {status && (
        <div className="mt-6 p-4 rounded-lg bg-gray-100 text-center">
          {status}
        </div>
      )}
    </div>
  );
}