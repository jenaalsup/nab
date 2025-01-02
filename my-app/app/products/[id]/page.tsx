'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirebase } from '../../../contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
import type { Product } from '../../../types/product';
import Navbar from '../../components/Navbar';

export default function ProductPage() {
  const { id } = useParams(); // Get the product ID from the URL
  const { db } = useFirebase();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto p-4">
              <Navbar />
      <Image 
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
    </div>
  );
}
