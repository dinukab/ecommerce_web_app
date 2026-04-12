'use client';

import React, { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Category {
  name: string;
  slug: string;
  icon?: string;
}

export default function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const categories: Category[] = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Headphones', slug: 'headphones' },
    { name: 'Speakers', slug: 'speakers' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Wearables', slug: 'wearables' },
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Cameras', slug: 'cameras' },
  ];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Menu Button */}
      <button className="flex items-center space-x-3 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
        <Menu className="h-5 w-5 text-gray-700" />
        <span className="font-medium text-gray-900">Categories</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-blue-50 transition-colors group"
              >
                <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                  {category.name}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
