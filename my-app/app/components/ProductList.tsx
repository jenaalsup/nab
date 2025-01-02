'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';
import { div } from 'framer-motion/client';

export default function ProductList() {
  const { db } = useFirebase();
  const [products, setProducts] = useState<Product[]>([]);

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

  
  return (
    <div className="mx-auto my-20 px-12">
        <div className="h-scroll w-[33%] h-screen" style={{ scrollBehavior: "smooth" }}>
      {products.map((product) => (
        <div key={product.id} className="">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </div>
  );

}


