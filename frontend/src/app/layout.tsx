import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { StoreProvider } from '@/context/StoreContext';
import React from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: 'Open Door - Your Online Marketplace',
  description: 'Shop quality products at the best prices with Open Door.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
        <StoreProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
