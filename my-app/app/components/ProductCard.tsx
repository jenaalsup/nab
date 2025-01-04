'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types/product';
import { calculateCurrentPrice } from '../../utils/priceCalculator';
import { useFirebase } from '../../contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
import { formatTimeLeft } from '@/utils/timeFormatter';

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
  const [sellerName, setSellerName] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(product.endDate));
  //const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    const updatePrice = async () => {
      /*const timeUntilExpiration = product.endDate - Date.now();
      if (timeUntilExpiration <= TWENTY_FOUR_HOURS) {
        await handleExpiredProduct(product, db);
      }*/

      const newPrice = calculateCurrentPrice(
        product.listedPrice,
        product.minimumPrice,
        product.createdAt,
        product.endDate,
        Date.now()
      );
      
      setCurrentPrice(newPrice);
    };

    updatePrice();
    const interval = setInterval(updatePrice, 300000); // update every 5 minutes
    return () => clearInterval(interval);
  }, [
    product.id, 
    product.listedPrice, 
    product.minimumPrice, 
    product.createdAt, 
    product.endDate,
    product, // Add back product
    db // Add back db
  ]);

  useEffect(() => {
    const fetchSellerName = async () => {
      const userDoc = await getDoc(doc(db, 'users', product.sellerId));
      if (userDoc.exists()) {
        setSellerName(userDoc.data().displayName || product.sellerEmail);
      }
    };
    fetchSellerName();
  }, [db, product.sellerId, product.sellerEmail]);

  useEffect(() => {
    // Update time left every minute
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(product.endDate));
    }, 120000); // every 2 minutes

    return () => clearInterval(interval);
  }, [product.endDate]);

  const handleCardClick = () => {
    router.push(`/products/${product.id}`); 
  };

  return (
    <div
      className="w-full h-full border rounded-lg shadow-sm p-4 bg-white/5 cursor-pointer hover:translate-y-[-5px] transition-all duration-300"
      onClick={handleCardClick} 
    >
      <img
        src={product.imageUrl} 
        alt={product.title}
        className="w-full aspect-square object-cover rounded-lg mb-4"
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
        {timeLeft}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Posted by: {sellerName || product.sellerEmail}
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
