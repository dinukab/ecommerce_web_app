'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { fetchCategories } from '@/api/Categoryapi';
import { storeConfig } from '@/lib/storeConfig';
import { useStore } from '@/context/StoreContext';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function Footer() {
  const { settings } = useStore();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.slice(0, 5));
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

          {/* Brand & Contact */}
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-4">
              {!logoError ? (
                <img
                  src={settings?.logoUrl || storeConfig.logoUrl}
                  alt={settings?.storeName || storeConfig.storeName}
                  className="h-8 w-auto object-contain brightness-0 invert"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: settings?.primaryColor || storeConfig.primaryColor }}
                >
                  <span className="text-white font-bold text-lg">
                    {(settings?.storeName || storeConfig.storeName)[0]}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold">{settings?.storeName || storeConfig.storeName}</span>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Your trusted online marketplace for quality products at the best prices.
            </p>

            <div className="flex gap-4 mb-6">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>

            {/* Contact details */}
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: settings?.primaryColor || storeConfig.primaryColor }} />
                <span>{settings?.address || storeConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: settings?.primaryColor || storeConfig.primaryColor }} />
                <a href={`tel:${settings?.phone || storeConfig.phone}`} className="hover:text-white transition-colors">
                  {settings?.phone || storeConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: settings?.primaryColor || storeConfig.primaryColor }} />
                <a href={`mailto:${settings?.email || storeConfig.email}`} className="hover:text-white transition-colors">
                  {settings?.email || storeConfig.email}
                </a>
              </li>
            </ul>
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
          <p>
            © {new Date().getFullYear()}{' '}
            <span style={{ color: storeConfig.primaryColor }} className="font-semibold">
              {storeConfig.storeName}
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

