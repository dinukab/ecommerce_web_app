'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, Heart, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <ShoppingBag className="w-7 h-7 text-[#151194] fill-[#151194]" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">OneShop</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-10">
            <div className="relative w-full ">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full pl-6 pr-12 py-2.5 bg-gray-200/70 border-black rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#151194] focus:bg-white transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-600 font-bold" />
            </div>
          </div>

          {/* Right Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/wishlist"
              className="flex items-center space-x-2 text-[#4a5f78] hover:text-[#151194] transition-colors"
            >
              <Heart className="w-5 h-5 fill-current text-[#4a5f78]" />
              <span className="font-bold text-sm">Wishlist</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center space-x-2 text-[#4a5f78] hover:text-[#151194] transition-colors"
            >
              <User className="w-5 h-5 fill-current text-[#4a5f78]" />
              <span className="font-bold text-sm">Account</span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center space-x-2 text-[#4a5f78] hover:text-[#151194] transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-[22px] h-[22px] fill-current text-[#4a5f78]" />
                <span className="absolute -top-[6px] -right-[8px] bg-[#151194] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white box-content">
                  2
                </span>
              </div>
              <span className="font-bold text-sm ml-1">Cart</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full pr-10 pl-4 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-[#151194]"
              />
            </div>
            <Link
              href="/wishlist"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}