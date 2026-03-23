import React from 'react';
import { Star, Heart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/product/${id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative p-4">
          {badge && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
              {badge}
            </span>
          )}
          <button className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50">
            <Heart className="h-5 w-5 text-gray-400" />
          </button>
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center mb-4">
            <span className="text-gray-400">Product Image</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          <div className="flex items-center space-x-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({reviews})</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">Rs {price}</span>
            {originalPrice && (
              <>
                <span className="text-sm text-gray-500 line-through">Rs {originalPrice}</span>
                <span className="text-sm font-medium text-green-600">Save {discount}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}