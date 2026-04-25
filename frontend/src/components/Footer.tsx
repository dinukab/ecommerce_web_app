'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { fetchCategories } from '@/api/Categoryapi';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  productCount?: number;
}

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.slice(0, 5)); // Show top 5 categories
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    loadCategories();
  }, []);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#151194] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold">OneShop</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted online marketplace for quality products at the best prices.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <Link 
                    href={`/category/${category.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  My Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 OneShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
