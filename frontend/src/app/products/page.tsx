'use client';

import Link from 'next/link';
import { products } from 'data/products';
import type { Product } from '@/types';

export default function ProductsPage() {
  const data: Product[] = products;

  return (
    <div className="max-w-6xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`}>
            <div className="border rounded-xl p-6 cursor-pointer hover:shadow-lg transition">
              
              <div className="h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-400">No image</span>
                )}
              </div>

              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-blue-900 font-bold mt-2">
                Rs.{item.price}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {item.category}
              </p>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}