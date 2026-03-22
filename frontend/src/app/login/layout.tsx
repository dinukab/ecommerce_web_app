import { CartProvider } from '@/context/CartContext';
import React from 'react';
import Link from 'next/link';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simplified Header for Auth Pages */}
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#151194] rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#151194]">OneShop</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 rounded-full border border-[#1f1d4e] text-sm font-medium text-[#1f1d4e] hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 rounded-full bg-[#151194] text-white text-sm font-medium hover:bg-[#252661] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
