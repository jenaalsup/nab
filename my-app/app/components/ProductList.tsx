'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';

export default function ProductList() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
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
    <>
      <div className="mb-6">
        <select 
          value={selectedCommunity}
          onChange={(e) => setSelectedCommunity(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Communities</option>
          <option value="Caltech">Caltech</option>
          <option value="NYU">NYU</option>
          <option value="Impact Labs">Impact Labs</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products
          .filter(product => 
            !selectedCommunity || 
            product.communities?.includes(selectedCommunity)
          )
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </>
  );
}