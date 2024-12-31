'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Product } from '../../types/product';

export default function CreateProduct() {
  const { db, auth } = useFirebase();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  if (!currentUser) {
    return null;
  }

  // Rest of your component remains the same
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await addDoc(collection(db, 'products'), productData);
      setStatus('Product created successfully!');
      setIsOpen(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Product</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product Title"
                className="w-full p-2 border rounded text-black"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product Description"
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="w-full p-2 border rounded text-black"
                required
              />
              <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Product
              </button>
            </form>
            {status && <p className="mt-4 text-center">{status}</p>}
          </div>
        </div>
      )}
    </>
  );
} 