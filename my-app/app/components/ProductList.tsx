'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';
import Select from 'react-select';
import { User } from '@/types/user';
import Link from 'next/link';

export default function ProductList() {
  const { db } = useFirebase();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<User[]>([]);

  const availableCommunities = [
    { value: 'Caltech', label: 'Caltech' },
    { value: 'NYU', label: 'NYU' },
    { value: 'Impact Labs', label: 'Impact Labs' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
  
      const activeProducts = productList.filter(product => 
        !product.is_bought && product.endDate > Date.now()
      );
  
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    };
  
    fetchProducts();
    const interval = setInterval(fetchProducts, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [db]);

  useEffect(() => {
    if (selectedCommunities.length === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.communities?.some(community => 
          selectedCommunities.includes(community)
        )
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCommunities, products]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    };
  
    fetchUsers();
  }, [db]);

  const filteredUsers = users.filter(user => {
    if (selectedCommunities.length === 0) return true;
    return user.communities?.some(community => 
      selectedCommunities.includes(community)
    );
  });

  return (
    <div className="relative w-full">
      <div className="mb-6">
        <div className="max-w-[900px] px-6 md:px-6 mx-auto flex items-center">
        <Select
          isMulti
          name="communities"
          options={availableCommunities}
          className="inline-flex flex-row align-left"
          value={availableCommunities.filter(option => 
            selectedCommunities.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            setSelectedCommunities(
              selectedOptions
                ? selectedOptions.map(option => option.value)
                : []
            );
          }}
          placeholder="Filter by community..."
        />
        <div className="flex gap-2 overflow-x-auto ml-8"> 
          {filteredUsers.map((user) => (
            <Link href={`/profile/${user.id}`} key={user.id}>
              <img
                src={user.photoURL || "/images/profile.png"}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
              />
            </Link>
          ))}
        </div>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        style={{ paddingBottom: '100px' }}
      >
        <div className="flex space-x-4 p-4 min-w-max" style={{ marginBottom: '60px' }}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex-none w-96">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}