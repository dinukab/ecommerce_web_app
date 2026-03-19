import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import React from 'react';

export const metadata: Metadata = {
  title: 'OneShop - Your Online Marketplace',
  description: 'Shop quality products at the best prices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
