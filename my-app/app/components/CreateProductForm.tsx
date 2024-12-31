'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function CreateProductForm() {
  const { db, auth } = useFirebase();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', imageFile!);
    formData.append('upload_preset', 'listings');
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dxzkav00b/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      const imageUrl = data.secure_url;
  
      // Then save product with imageUrl to Firestore
      const productData = {
        title,
        description,
        price: parseFloat(price),
        imageUrl,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email!,
        createdAt: Date.now()
      };
  
      await addDoc(collection(db, 'products'), productData);
      router.push('/products');
    } catch (error) {
      console.error('Error:', error);
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
          <label className="block text-sm font-medium mb-2">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded-lg text-black"
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 w-full h-48 object-cover rounded-lg"
            />
          )}
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