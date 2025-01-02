'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

export default function CreateProductForm() {
  const { db, auth } = useFirebase();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [communities, setCommunities] = useState<string[]>([]);

  const availableCommunities = [
    { value: 'Caltech', label: 'Caltech' },
    { value: 'NYU', label: 'NYU' },
    { value: 'Impact Labs', label: 'Impact Labs' }
  ];


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

    if (!title || !description || !currentPrice || !minimumPrice || !endDate || !imageFile) {
      setStatus('Please fill in all fields');
      return;
    }

    if (parseFloat(minimumPrice) > parseFloat(currentPrice)) {
      setStatus('Minimum price cannot be higher than current price');
      return;
    }

    const endDateTime = new Date(endDate).getTime();
    if (endDateTime <= Date.now()) {
      setStatus('End date must be in the future');
      return;
    }

    setStatus('Uploading...');
    
    const formData = new FormData();
    formData.append('file', imageFile);
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

      const productData = {
        title,
        description,
        listedPrice: parseFloat(currentPrice),    // Store original price
        currentPrice: parseFloat(currentPrice),    // Start with same price
        minimumPrice: parseFloat(minimumPrice),
        endDate: endDateTime,
        imageUrl,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email!,
        createdAt: Date.now(),
        communities: communities,
        is_bought: false, 
      };

      await addDoc(collection(db, 'products'), productData);
      setStatus('Product created successfully!');
      
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Error updating price:', error.message);
        setStatus(`Error: ${error.message}`);
      } else {
        console.error('Unknown error updating price:', error);
      }
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
          <label className="block text-sm font-medium mb-2">Current Price ($)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-3 border rounded-lg text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Price ($)</label>
          <input
            type="number"
            value={minimumPrice}
            onChange={(e) => setMinimumPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-3 border rounded-lg text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Communities</label>
          <Select
            isMulti
            name="communities"
            options={availableCommunities}
            className="mt-1"
            value={availableCommunities.filter(option => 
              communities.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              setCommunities(
                selectedOptions
                  ? selectedOptions.map(option => option.value)
                  : []
              );
            }}
            placeholder="Select communities for this listing..."
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