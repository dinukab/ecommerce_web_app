'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  image?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  image,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Format price in LKR
  const formatPrice = (amount: number) => {
    if (amount === undefined || amount === null) return 'LKR 0.00';
    return `LKR ${amount.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Link href={`/product/${id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Wishlist Icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add wishlist functionality
            }}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
          </button>

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  badge === 'Sale'
                    ? 'bg-red-500 text-white'
                    : badge === 'New'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {badge}
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}