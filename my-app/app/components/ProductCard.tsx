'use client';

import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const endDate = new Date(product.endDate);
  const daysLeft = Math.ceil((product.endDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white/5">
      <img 
        src={product.imageUrl} 
        alt={product.title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold">{product.title}</h3>
      <p className="text-gray-600 mt-2">{product.description}</p>
      <p className="text-lg font-bold mt-2">${product.currentPrice}</p>
      <p className="text-sm text-gray-500">
        Minimum price: ${product.minimumPrice}
      </p>
      <p className="text-sm text-gray-500">
        {daysLeft > 0 ? `${daysLeft} days left` : 'Listing ended'}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Posted by: {product.sellerEmail}
      </p>
    </div>
  );
}