'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isCheckoutFlowPage = pathname.startsWith('/cart/checkout');
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center justify-between h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-9 h-9 bg-[#151194] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">OneShop</span>
          </Link>

          {/* Search Bar - Desktop */}
          {!isCheckoutFlowPage && (
            <div className="flex md:flex flex-1 max-w-2xl xl:max-w-3xl mx-4 lg:mx-10 xl:mx-16">
              <div className="relative w-full ">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 bg-linear-to-r from-gray-100 to-gray-300  rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none    transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-600 font-bold" />
              </div>
            </div>
          )}

          {/* Right Buttons - Desktop */}
          <div className="flex md:flex items-center space-x-10">
            {!isCheckoutFlowPage && (
              <Link
                href="/profile/wishlist"
                className="flex items-center space-x-1 text-[#3b3b3b] hover:text-[#151194] transition-colors whitespace-nowrap"
              >
                <Heart className="w-5 h-5 fill-current text-[#3b3b3b] hover:text-[#151194]" />
                <span className="font-bold text-sm">Wishlist</span>
              </Link>
            )}

            {!isCheckoutFlowPage && (
              <Link
                href="/cart"
                className="flex items-center space-x-1 text-[#3b3b3b] hover:text-[#151194] transition-colors whitespace-nowrap"
              >
                <div className="relative">
                  <ShoppingCart className="w-5.5 h-5.5 fill-current text-[#3b3b3b] hover:text-[#151194]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#151194] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white box-content">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm ml-1">Cart</span>
              </Link>
            )}

            <Link
              href="/profile"
              className="flex items-center space-x-1 text-[#3b3b3b] hover:text-[#151194] transition-colors whitespace-nowrap"
            >
              <User className="w-5 h-5 fill-current text-[#3b3b3b] hover:text-[#151194]" />
              <span className="font-bold text-sm">Account</span>
            </Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}