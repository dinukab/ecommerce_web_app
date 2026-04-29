'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.getWishlist(token);
      if (response.success && response.data) {
        setWishlist(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      await api.removeFromWishlist(token, productId);
      setWishlist(wishlist.filter((p) => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="relative group">
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.sellingPrice}
                  originalPrice={product.costPrice}
                  rating={product.rating || 0}
                  reviews={product.numReviews || 0}
                  badge={product.badge}
                  image={product.images?.[0]}
                  initialWishlisted={true}
                  onWishlistRemove={removeFromWishlist}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love and buy them later.</p>
            <Button onClick={() => (window.location.href = '/category/all')}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

