'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("API ERROR:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-10">Loading products...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`}>
            <div className="border rounded-xl p-6 cursor-pointer hover:shadow-lg transition">
              
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                Image
              </div>

              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-blue-600 font-bold mt-2">
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