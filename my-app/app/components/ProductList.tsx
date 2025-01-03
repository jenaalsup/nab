'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';

export default function ProductList() {
  const { db } = useFirebase();
  const [products, setProducts] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productList);
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (containerRef.current) {
        e.preventDefault();
        containerRef.current.scrollLeft += e.deltaY;
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-hidden h-screen"
    >
      <div className="flex space-x-4 p-4">
        {[...products, ...products, ...products].map((product, index) => (
          <div key={`${product.id}-${index}`} className="flex-none w-72">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}