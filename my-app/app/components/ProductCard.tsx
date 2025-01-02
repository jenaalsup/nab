'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation'; // Import useRouter
import { Product } from '../../types/product';
import { calculateCurrentPrice } from '../../utils/priceCalculator';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { db } = useFirebase();
  const router = useRouter();
  const [currentPrice, setCurrentPrice] = useState(() => 
    calculateCurrentPrice(
      product.listedPrice,
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
        product.listedPrice,
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

  const handleCardClick = () => {
    router.push(`/products/${product.id}`); // Navigate to the dynamic route
  };

  return (
    <div
      className="w-full h-full border rounded-lg shadow-sm p-4 bg-white/5 cursor-pointer hover:translate-y-[-5px] transition-all duration-300"
      onClick={handleCardClick} // Add click handler
    >
      {product.is_bought && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-500 text-white rounded-full text-xs">
          Sold
        </div>
      )}
      <img
        src={product.imageUrl} 
        alt={product.title}
        className="w-full h-full object-cover rounded-lg mb-4"
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
      <div className="mt-2">
        {product.communities && product.communities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.communities.map((community) => (
              <span 
                key={community}
                className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {community}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  
}
