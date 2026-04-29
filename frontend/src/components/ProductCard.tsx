import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Plus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  image?: string;
  initialWishlisted?: boolean;
  onWishlistRemove?: (id: string) => void;
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
  initialWishlisted = false,
  onWishlistRemove,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to add to wishlist');
      router.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.removeFromWishlist(token, id);
        setIsWishlisted(false);
        if (onWishlistRemove) onWishlistRemove(id);
      } else {
        await api.addToWishlist(token, id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      _id: id,
      name,
      sellingPrice: price,
      costPrice: originalPrice || price,
      images: image ? [image] : [],
      rating,
      numReviews: reviews,
      stock: 99, // Fallback
      category: 'General', // Fallback
      description: name, // Fallback
    } as any);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group cursor-pointer h-full flex flex-col">
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
            onClick={handleWishlist}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors z-10 group/heart"
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isWishlisted 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600 group-hover/heart:text-red-500 group-hover/heart:fill-red-500'
              }`} 
            />
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
                    : 'bg-brand-light0 text-white'
                }`}
              >
                {badge}
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-brand-light0 text-white px-2 py-1 rounded text-sm font-bold">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            className={`mb-3 w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              added 
                ? 'bg-emerald-500 text-white' 
                : 'bg-brand hover:bg-brand-dark text-white shadow-md'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm">Added</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add</span>
              </>
            )}
          </button>

          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
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
          <div className="flex items-center space-x-2 mt-auto">
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
