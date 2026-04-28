"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuantityPicker from "@/components/quantity-picker";
import { ArrowLeft, ShoppingBag, Trash2, ShoppingCart, Plus } from "lucide-react";
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
import { fetchProducts, type Product } from '@/api/Productapi';
import ProductCard from '@/components/category/ProductCard';
import { api } from "@/lib/api";

const PLACEHOLDER = 'https://placehold.co/400x400/e8eaff/6366f1?text=No+Image';

export default function CartPage() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const orderTotal = subtotal;

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [moreProducts, setMoreProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (cart.length === 0) return;
      
      try {
        setLoadingRelated(true);
        const categories = [...new Set(cart.map(item => item.category).filter(Boolean))];
        
        // 1. Fetch Related Products (same category)
        let related: Product[] = [];
        if (categories.length > 0) {
          const categorySlug = categories[0]
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const res = await fetchProducts({ category: categorySlug, limit: 10 });
          const cartIds = cart.map(c => c._id);
          related = (res.data || []).filter((p: Product) => !cartIds.includes(p._id));
        }

        // Fallback for related if empty
        if (related.length === 0) {
          const fallbackRes = await fetchProducts({ sort: 'rating', limit: 10 });
          const cartIds = cart.map(c => c._id);
          related = (fallbackRes.data || []).filter((p: Product) => !cartIds.includes(p._id));
        }
        setRelatedProducts(related);

        // 2. Fetch "More Products" (random/newest) for the grid below
        const moreRes = await fetchProducts({ limit: 12, sort: 'newest' });
        const usedIds = [...cart.map(c => c._id), ...related.map(r => r._id)];
        const filteredMore = (moreRes.data || []).filter((p: Product) => !usedIds.includes(p._id));
        setMoreProducts(filteredMore);

      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    loadData();
  }, [cart]);

  // Sync cart to DB then navigate to checkout
  const handleCheckout = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const rawUser = localStorage.getItem('user');

      // Only sync if the user is logged in
      if (token && rawUser) {
        const user = JSON.parse(rawUser);
        const userId = user.id || user._id;

        if (userId) {
          await api.syncCart(
            String(userId),
            cart.map((item) => ({ productId: item._id, quantity: item.quantity }))
          );
        }
      }
    } catch (err) {
      // Sync failure is non-fatal — checkout page still works from local state
      console.warn('[Cart] DB sync failed, proceeding anyway:', err);
    } finally {
      setSyncing(false);
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand">
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
                          <h3 className="font-semibold text-gray-900 text-sm hover:text-brand truncate cursor-pointer">
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
                <p className="text-gray-600 font-medium text-base mb-4">Your cart is empty</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-8 px-6 py-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => router.push("/")}
              className="mt-6 flex items-center gap-2 text-brand font-medium hover:text-brand-dark transition-colors"
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
              items={cart}
              isCart={true}
              onCheckout={handleCheckout}
              loading={syncing}
            />
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like...</h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2">
              {relatedProducts.map((product) => (
                <CarouselItem key={product._id} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="-left-3 h-8 w-8 bg-white border-gray-200 shadow-sm" />
              <CarouselNext className="-right-3 h-8 w-8 bg-white border-gray-200 shadow-sm" />
            </div>
          </Carousel>
        </div>
      )}

      {/* This is not suggetion .show some products for sale. Other Great Picks Section (Vertical Grid) .t*/}
      {moreProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Other Great Picks</h2>
              
            </div>
            <Link href="/category/all" className="text-sm font-bold text-blue-600 hover:text-blue-500">
              See All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {moreProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

