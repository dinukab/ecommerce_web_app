import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
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
