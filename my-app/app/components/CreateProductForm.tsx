'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from 'react-select';
import { Product } from '@/types/product';

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
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  const productId = searchParams.get('productId');
  const [timezone, setTimezone] = useState('America/Los_Angeles');

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


  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditing || !productId || !currentUser) return;

      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product;
          // Verify ownership
          if (productData.sellerId !== currentUser.uid) {
            router.push('/products');
            return;
          }
          
          const date = new Date(productData.endDate);
          const localDate = date.toLocaleString('en-US', { timeZone: productData.timezone || 'America/New_York' });
          setEndDate(new Date(localDate).toISOString().slice(0, 16));
          setTimezone(productData.timezone || 'America/Los_Angeles');
          setTitle(productData.title);
          setDescription(productData.description);
          setCurrentPrice(productData.currentPrice.toString());
          setMinimumPrice(productData.minimumPrice.toString());
          setCommunities(productData.communities || []);
          setImagePreview(productData.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setStatus('Failed to fetch product data');
      }
    };

    fetchProduct();
  }, [isEditing, productId, currentUser, db, router]);

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
  
    if (!title || !description || !currentPrice || !minimumPrice || !endDate || (!imageFile && !isEditing)) {
      setStatus('Please fill in all fields');
      return;
    }
  
    if (parseFloat(minimumPrice) > parseFloat(currentPrice)) {
      setStatus('Minimum price cannot be higher than current price');
      return;
    }
  
    const endDateTime = new Date(endDate).toLocaleString('en-US', { timeZone: timezone });
    const endTimestamp = new Date(endDateTime).getTime();
  
    if (endTimestamp <= Date.now()) {
      setStatus('End date and time must be in the future');
      return;
    }
  
    setStatus('Uploading...');
    
    try {
      let imageUrl = imagePreview;
  
      // Only upload new image if file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'listings');
  
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dxzkav00b/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        imageUrl = data.secure_url;
      }
  
      const productData = {
        title,
        description,
        listedPrice: parseFloat(currentPrice),
        currentPrice: parseFloat(currentPrice),
        minimumPrice: parseFloat(minimumPrice),
        endDate: endTimestamp,
        timezone: timezone,
        imageUrl,
        communities,
        updatedAt: Date.now(),
        ...(searchParams.get('relist') === 'true' && {
          createdAt: Date.now(),
          is_bought: false
        })
      };
  
      if (isEditing && productId) {
        // Update existing product
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, productData);
        setStatus('Product updated successfully!');
      } else {
        // Create new product
        await addDoc(collection(db, 'products'), {
          ...productData,
          sellerId: currentUser.uid,
          sellerEmail: currentUser.email!,
          createdAt: Date.now(),
          is_bought: false,
        });
        setStatus('Product created successfully!');
      }
  
      setTimeout(() => {
        router.push(isEditing ? `/products/${productId}` : '/products');
      }, 1500);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Error updating product:', error.message);
        setStatus(`Error: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  const today = new Date();
  const tzDate = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
  const minDate = tzDate.toISOString().split('T')[0];

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
          <label className="block text-sm font-medium mb-2">End Date and Time</label>
          <div className="flex gap-4">
            <input
              type="date"
              value={endDate.split('T')[0]}
              onChange={(e) => setEndDate(prev => `${e.target.value}T${prev.split('T')[1] || '23:59'}`)}
              min={minDate}
              className="w-full p-3 border rounded-lg text-black"
              required
            />
            <input
              type="time"
              value={endDate.split('T')[1] || '23:59'}
              onChange={(e) => setEndDate(prev => `${prev.split('T')[0]}T${e.target.value}`)}
              className="w-full p-3 border rounded-lg text-black"
              required
            />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-3 border rounded-lg text-black"
              required
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded-lg text-black"
            required={!isEditing}
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
          {isEditing 
            ? searchParams.get('relist') === 'true'
              ? 'Relist Item'
              : 'Update Listing'
            : 'List Item for Sale'}
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