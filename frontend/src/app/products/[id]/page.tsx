"use client";

import { useParams } from "next/navigation";

const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 120,
    description: "High quality noise cancelling headphones.",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 200,
    description: "Premium smartwatch with fitness tracking.",
    category: "Electronics",
  },
  {
    id: "3",
    name: "T-Shirt",
    price: 40,
    description: "Comfortable cotton T-shirt.",
    category: "Clothing",
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return <div className="p-10 text-red-500">Product Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <div className="grid grid-cols-2 gap-10">
        
        {/* Image Section */}
        <div>
          <div className="bg-gray-100 p-10 rounded-xl">
            <div className="h-64 bg-gray-300 rounded-lg flex items-center justify-center">
              Image Placeholder
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-2xl text-[#151194] font-bold mb-4">
            Rs.{product.price}
          </p>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <button
            onClick={() => alert("Added to cart")}
            className="bg-[#151194] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#0c0a5c] transition-colors"
          >
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}