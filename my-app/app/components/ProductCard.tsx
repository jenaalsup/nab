'use client';

import { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { calculateCurrentPrice } from '../../utils/priceCalculator';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { db } = useFirebase();
  const [currentPrice, setCurrentPrice] = useState(() => 
    calculateCurrentPrice(
      product.listedPrice,  // Use listedPrice for calculation
      product.minimumPrice,
      product.createdAt,
      product.endDate,
      Date.now()
    )
  );
  
  const daysLeft = Math.ceil((product.endDate - Date.now()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const updatePrice = async () => {
      const newPrice = calculateCurrentPrice(
        product.listedPrice,  // Use listedPrice for calculation
        product.minimumPrice,
        product.createdAt,
        product.endDate,
        Date.now()
      );

      try {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, {
          currentPrice: newPrice
        });
        setCurrentPrice(newPrice);
      } catch (error) {
        console.error('Error updating price:', error);
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 300000); // update every 5 minutes
    return () => clearInterval(interval);
  }, [product.id, product.listedPrice, product.minimumPrice, product.createdAt, product.endDate, db]);

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white/5">
      <Image 
        src={product.imageUrl} 
        height={100}
        width={100}
        alt={product.title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold">{product.title}</h3>
      <p className="text-gray-600 mt-2">{product.description}</p>
      <div className="mt-2">
        <p className="text-lg font-bold">
          ${(currentPrice || 0).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          Listed price: ${(product.listedPrice || 0).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          Minimum price: ${(product.minimumPrice || 0).toFixed(2)}
        </p>
      </div>
      <p className="text-sm text-gray-500">
        {daysLeft > 0 ? `${daysLeft} days left` : 'Listing ended'}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Posted by: {product.sellerEmail}
      </p>
    </div>
  );
}