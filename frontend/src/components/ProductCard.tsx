'use client';

import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();

  const navigateToProduct = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col justify-between cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={navigateToProduct}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToProduct();
        }
      }}
      aria-label={`View ${product.name}`}
    >

      {/* Product Color Block (No Image) */}
      <div className="w-full h-36 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4">
        <span className="text-blue-400 font-semibold text-lg tracking-wide">
          {product.name}
        </span>
      </div>

      {/* Product Info */}
      <div className="flex flex-col space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="text-gray-900 font-semibold text-lg leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#151194] font-bold text-xl">
            Rs.{product.price}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-4 py-2 bg-[#151194] text-white text-sm font-semibold rounded-lg hover:bg-[#0c0a5c] active:scale-95 transition-all duration-150"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}