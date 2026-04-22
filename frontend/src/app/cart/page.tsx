"use client";

import { useRouter } from "next/navigation";
import QuantityPicker from "@/components/quantity-picker";
import { ArrowLeft, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import OrderSummary from '@/components/OrderSummary';
import { useCart } from "@/context/CartContext";

const PLACEHOLDER = 'https://placehold.co/400x400/e8eaff/6366f1?text=No+Image';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const shipping = cart.length > 0 ? 400 : 0;
  const orderTotal = subtotal + shipping;

  // Recommended products can stay hardcoded or we could fetch them later
  const recommendedProducts = [
    {
      id: "009",
      name: "Fresh Milk (1L)",
      price: 450,
      image: "https://placehold.co/400x400/e3f2fd/1565c0?text=Milk",
    },
    {
      id: "010",
      name: "Organic Honey",
      price: 1800,
      image: "https://placehold.co/400x400/fff8e1/ffa000?text=Honey",
    },
    {
      id: "011",
      name: "Whole Wheat Bread",
      price: 220,
      image: "https://placehold.co/400x400/efebe9/5d4037?text=Bread",
    },
    {
      id: "012",
      name: "Brown Eggs (10pk)",
      price: 650,
      image: "https://placehold.co/400x400/fbe9e7/d84315?text=Eggs",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
          <p className="text-gray-500 text-sm">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your basket
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="md:col-span-5 flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img 
                          src={item.images?.[0] || PLACEHOLDER} 
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Link href={`/product/${item._id}`}>
                          <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 truncate cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 mt-2 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        LKR {item.sellingPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 md:flex md:justify-center">
                      <QuantityPicker
                        value={item.quantity}
                        onChange={(qty: number) => updateQuantity(item._id, qty)}
                        min={1}
                      />
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 md:text-right">
                      <span className="text-sm font-bold text-blue-600">
                        LKR {(item.sellingPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-base mb-4">You have 3 items in your cart</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => router.push("/")}
              className="mt-6 flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              orderTotal={orderTotal}
              cartItems={cart as any}
            />
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {cart.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like</h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2">
              {recommendedProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full">
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-blue-600 font-bold text-sm">LKR {product.price.toLocaleString()}</span>
                      <button className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="-left-3 h-8 w-8 bg-white border-gray-200" />
              <CarouselNext className="-right-3 h-8 w-8 bg-white border-gray-200" />
            </div>
          </Carousel>
        </div>
      )}
    </div>
  );
}
