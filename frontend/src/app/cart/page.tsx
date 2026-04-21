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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Cart Items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-gray-50">
              {cart.map((item) => (
                <div key={item._id} className="p-8 group">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    {/* Product Info */}
                    <div className="col-span-1 sm:col-span-6 flex gap-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                        <img 
                          src={item.images?.[0] || PLACEHOLDER} 
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer">
                          <Link href={`/product/${item._id}`}>{item.name}</Link>
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">{item.category}</p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Item
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-1 sm:col-span-2 text-center">
                      <span className="text-sm font-bold text-gray-900">
                        RS {item.sellingPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 sm:col-span-2 flex justify-center">
                      <QuantityPicker
                        value={item.quantity}
                        onChange={(qty: number) => updateQuantity(item._id, qty)}
                        min={1}
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-1 sm:col-span-2 text-right">
                      <span className="text-lg font-black text-[#151194]">
                        RS {(item.sellingPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-lg mb-6">Your cart is feeling a bit light.</p>
                <Link
                  href="/category/all"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#151194] text-white font-bold rounded-2xl hover:bg-[#0c0a5c] transition-all"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-10 flex items-center gap-2 text-[#151194] font-bold hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4">
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
      <div className="mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">You may also like</h2>
          <div className="flex gap-2">
            {/* Carousel buttons will be handled by the component */}
          </div>
        </div>

        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {recommendedProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 relative group">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-indigo-600 font-black">RS {product.price.toLocaleString()}</span>
                    <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#151194] hover:text-white transition-all">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-4 bg-white border-gray-200" />
            <CarouselNext className="-right-4 bg-white border-gray-200" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}
