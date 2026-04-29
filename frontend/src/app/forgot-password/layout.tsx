'use client';

import { CartProvider } from '@/context/CartContext';
import { StoreProvider, useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { storeConfig } from '@/lib/storeConfig';
import React from 'react';

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <CartProvider>
        <ForgotPasswordContent>{children}</ForgotPasswordContent>
      </CartProvider>
    </StoreProvider>
  );
}

function ForgotPasswordContent({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simplified Header for Auth Pages */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img 
              src={settings?.logoUrl || storeConfig.logoUrl} 
              alt={settings?.storeName || storeConfig.storeName} 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">{settings?.storeName || storeConfig.storeName}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full border border-brand text-sm font-medium text-brand hover:bg-brand-light/20 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-2 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
