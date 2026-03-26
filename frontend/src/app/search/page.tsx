'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/filters';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
}

export default function SearchPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const products: Product[] = [
    {
      id: '1',
      name: 'Product_001',
      price: 1800,
      originalPrice: 2000,
      rating: 5,
      reviews: 245,
      badge: 'Best Seller',
    },
    {
      id: '2',
      name: 'Product_002',
      price: 2100,
      originalPrice: 2400,
      rating: 4,
      reviews: 189,
    },
    {
      id: '3',
      name: 'Product_003',
      price: 3200,
      rating: 5,
      reviews: 312,
      badge: 'New Arrival',
    },
    {
      id: '4',
      name: 'Product_004',
      price: 1500,
      originalPrice: 1800,
      rating: 4,
      reviews: 156,
    },
    {
      id: '5',
      name: 'Product_005',
      price: 2300,
      originalPrice: 2500,
      rating: 5,
      reviews: 428,
      badge: 'Best Seller',
    },
    {
      id: '6',
      name: 'Product_006',
      price: 2800,
      rating: 4,
      reviews: 203,
    },
    {
      id: '7',
      name: 'Product_007',
      price: 1950,
      originalPrice: 2200,
      rating: 5,
      reviews: 367,
    },
    {
      id: '8',
      name: 'Product_008',
      price: 3500,
      rating: 4,
      reviews: 178,
      badge: 'New Arrival',
    },
    {
      id: '9',
      name: 'Product_009',
      price: 1650,
      originalPrice: 1900,
      rating: 5,
      reviews: 294,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-pointer">Home</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Search Results</span>
        </div>

        {/* Search Info & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Search Results</h1>
            <p className="text-gray-600">{products.length} products found</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <Filters />
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden col-span-1 mb-6">
              <Filters />
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center space-x-2">
              <button 
                disabled
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}