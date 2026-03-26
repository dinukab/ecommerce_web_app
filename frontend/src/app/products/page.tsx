'use client';

import React, { useState } from 'react';
import QuantitySelector from '@/components/QuantitySelector';
import Button from '@/components/Button';
import { Star, Truck, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Product {
  name: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  description: string;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  text: string;
  reviewer: string;
}

interface ProductData {
  [key: string]: Product;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [selectedModel, setSelectedModel] = useState<string>('Standard');
  const [showAddedToCart, setShowAddedToCart] = useState<boolean>(false);

  // Product data based on ID
  const productData: ProductData = {
    '1': {
      name: 'Product_001',
      price: 1800,
      originalPrice: 2000,
      rating: 5,
      reviews: 245,
      description: 'Premium wireless headphones with active noise cancellation. Experience exceptional sound quality with our latest audio technology and superior materials to deliver exceptional performance and durability. Perfect for both everyday use and special occasions.',
    },
    '2': {
      name: 'Product_002',
      price: 2100,
      originalPrice: 2400,
      rating: 4,
      reviews: 189,
      description: 'High-performance portable speaker with 360-degree sound. Perfect for parties and outdoor adventures with exceptional battery life.',
    },
    '3': {
      name: 'Product_003',
      price: 3200,
      originalPrice: null,
      rating: 5,
      reviews: 312,
      description: 'Professional studio monitor headphones. Crystal clear audio for music production and critical listening.',
    },
    '4': {
      name: 'Product_004',
      price: 1500,
      originalPrice: 1800,
      rating: 4,
      reviews: 156,
      description: 'Compact Bluetooth earbuds with charging case. Comfortable fit for all-day wear.',
    },
    '5': {
      name: 'Product_005',
      price: 2300,
      originalPrice: 2500,
      rating: 5,
      reviews: 428,
      description: 'Experience premium quality with our latest product. Designed with cutting-edge technology and superior materials to deliver exceptional performance and durability. Perfect for both everyday use and special occasions.',
    },
  };

  const product: Product = productData[productId] || productData['1'];

  const reviews: Review[] = [
    {
      id: 1,
      rating: 5,
      title: 'Excellent Product!',
      text: 'This product exceeded my expectations. The quality is outstanding and it works perfectly.',
      reviewer: 'John Doe',
    },
    {
      id: 2,
      rating: 4,
      title: 'Great value for money',
      text: 'Very satisfied with this purchase. Good quality and fast delivery.',
      reviewer: 'Jane Smith',
    },
    {
      id: 3,
      rating: 5,
      title: 'Highly recommended',
      text: 'Amazing product! Would definitely buy again. Customer service was also very helpful.',
      reviewer: 'Mike Johnson',
    },
  ];

  const handleAddToCart = () => {
    setShowAddedToCart(true);
    setTimeout(() => {
      setShowAddedToCart(false);
    }, 3000);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Add to Cart Success Message */}
      {showAddedToCart && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3">
          <Check className="h-5 w-5" />
          <span className="font-medium">Product added to cart!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span className="hover:text-blue-600 cursor-pointer">Home</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-blue-600 cursor-pointer">Category_001</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Product{productId}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Side - Images */}
          <div>
            <div className="bg-gray-200 rounded-lg mb-4 aspect-square flex items-center justify-center">
              <span className="text-gray-400 text-lg">Product Image</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((thumb) => (
                <div
                  key={thumb}
                  className={`bg-gray-200 rounded-lg aspect-square flex items-center justify-center cursor-pointer ${
                    thumb === 1 ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <span className="text-gray-400 text-xs">{thumb}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">Rs {product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">Rs {product.originalPrice}</span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Standard</option>
                <option>Premium</option>
                <option>Deluxe</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
            </div>

            <Button onClick={handleAddToCart} className="w-full mb-8">
              Add to Cart
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Free Shipping</div>
                  <div className="text-xs text-gray-600">On orders over Rs 1000</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <RotateCcw className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">30-day Returns</div>
                  <div className="text-xs text-gray-600">Easy return policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm mb-16">
          <div className="border-b">
            <div className="flex space-x-8 px-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium capitalize transition-colors relative ${
                    activeTab === tab
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Immersive Sound, All Day Long
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our premium product is engineered to deliver exceptional performance and reliability.
                  With advanced features and thoughtful design, it provides the perfect balance of
                  functionality and style. Whether you're using it daily or for special occasions,
                  you can count on consistent, high-quality results.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">Feature_001: Advanced technology for superior performance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">Feature_002: Durable construction with premium materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">Feature_003: Ergonomic design for maximum comfort</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b py-3">
                    <span className="font-medium text-gray-700">Brand:</span>
                    <span className="text-gray-600 ml-2">OneShop</span>
                  </div>
                  <div className="border-b py-3">
                    <span className="font-medium text-gray-700">Model:</span>
                    <span className="text-gray-600 ml-2">{product.name}</span>
                  </div>
                  <div className="border-b py-3">
                    <span className="font-medium text-gray-700">Weight:</span>
                    <span className="text-gray-600 ml-2">500g</span>
                  </div>
                  <div className="border-b py-3">
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="text-gray-600 ml-2">20 x 15 x 5 cm</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
                <p className="text-gray-600">See customer reviews below.</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-3">{renderStars(review.rating)}</div>
                <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{review.text}</p>
                <p className="text-sm text-gray-500">— {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">OneShop</h3>
              <p className="text-gray-600 text-sm">
                Your trusted online shopping destination for quality products.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer">All Products</li>
                <li className="hover:text-blue-600 cursor-pointer">Categories</li>
                <li className="hover:text-blue-600 cursor-pointer">New Arrivals</li>
                <li className="hover:text-blue-600 cursor-pointer">Sale</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer">Contact Us</li>
                <li className="hover:text-blue-600 cursor-pointer">FAQ</li>
                <li className="hover:text-blue-600 cursor-pointer">Shipping</li>
                <li className="hover:text-blue-600 cursor-pointer">Returns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Newsletter</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-gray-600">
            © 2024 OneShop. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}