"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, Truck, RefreshCcw, ChevronRight, Check, Share2, Heart } from "lucide-react";
import type { Product } from "@/types";
import { getProductById } from "data/products";
import { useCart } from "@/context/CartContext";

type Review = {
  _id: string;
  user: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const idValue = Array.isArray(id) ? id[0] : id;
  const productId = Number(idValue);

  const product: Product | undefined = Number.isFinite(productId)
    ? getProductById(productId)
    : undefined;

  if (!product) {
    return <div className="p-10 max-w-7xl mx-auto text-red-500 flex items-center justify-center h-64">Product Not Found</div>;
  }

  const reviews: Review[] = [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 mb-20 text-gray-800">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-8 mt-4 space-x-2">
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:underline">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left Col: Images */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#f0f2f5] aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden">
           {product.images && product.images.length > 0 ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
             ) : (
                <span className="text-xl font-medium text-gray-400">Image Placeholder</span>
             )}
          </div>
          <div className="flex gap-4">
             {/* Thumbnail placeholders */}
             {[1, 2, 3].map((num) => (
               <div key={num} className="w-20 h-20 bg-[#f0f2f5] rounded-xl flex items-center justify-center border border-transparent hover:border-gray-300 cursor-pointer transition">
                  {product.images && product.images[num] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[num]} alt="thumb" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                     <span className="text-xs text-gray-400">Thumb</span>
                  )}
               </div>
             ))}
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
            </div>
            <span className="ml-2 font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({product.reviews} Reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-[#151194]">Rs {product.price}</span>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>



          <div className="flex items-center gap-6 mb-10 pt-4 border-t border-gray-100">
             <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg transition"
                >
                  -
                </button>
                <div className="flex-1 flex items-center justify-center font-semibold text-center border-l border-r border-gray-300 h-full">
                  {qty}
                </div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg transition"
                >
                  +
                </button>
             </div>
             <button
               onClick={() => addToCart(product, qty)}
               className="flex-1 bg-[#151194] hover:bg-[#0f0c6e] text-white h-12 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm shadow-[#151194]/20"
               
             >
                Buy Now
             </button>

             <button
               onClick={() => addToCart(product, qty)}
               className="flex-1 bg-gray-200 hover:bg-gray-300 text-black h-12 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm shadow-[#151194]/10 border-gray-600 border"
             >
                Add to Cart
             </button>

             
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3  mb-10">
            <button
              type="button"
              className=" sm:w-20  rounded-xl py-3 flex items-center justify-center gap-2 text-gray-900 font-medium hover:bg-gray-50 transition cursor-pointer"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              type="button"
              className="w-full sm:w-20   rounded-xl py-3 flex items-center justify-center gap-2 text-gray-900 font-medium hover:bg-gray-50 transition cursor-pointer"
              aria-label="Likes"
            >
              <Heart className="w-4 h-4" />
              <span>25</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 text-sm font-medium text-gray-700">
             <div className="flex items-center gap-3">
               <Truck className="w-5 h-5 text-gray-400" />
               Free Shipping
             </div>
             <div className="flex items-center gap-3">
               <RefreshCcw className="w-5 h-5 text-gray-400" />
               30 Days Return
             </div>
          </div>
        </div>
      </div>

      <hr className="my-16 border-gray-200" />

      {/* Middle Section: Specs / Highlights */}
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Immersive Sound, All Day Long</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
            Engineered for the enthusiast, this product combines state-of-the-art features with a profile that is rich, deep, and incredibly detailed. Whether you&apos;re commuting, working from a busy cafe, or just relaxing at home, the world fades away, leaving only your experience.
        </p>
        <ul className="space-y-4">
          <li className="flex items-center gap-3 text-gray-700">
            <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div>
            Premium Quality Logic
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div>
            Ergonomic Design Profile
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <div className="bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /></div>
            Long Lasting Durability
          </li>
        </ul>
      </div>

      <hr className="my-16 border-gray-200" />

      {/* Bottom Section: Customer Reviews */}
      <div>
         <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">out of 5 based on {product.reviews} review(s).</span>
              </div>
            </div>
            <Link 
              href={`/products/${product.id}/review`}
              className="text-[#151194] font-semibold border-2 border-[#151194] px-4 py-2 rounded-lg hover:bg-blue-50 transition shadow-sm inline-block"
            >
              Write a Review
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                 <div key={review._id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-1 mb-3">
                       {renderStars(review.rating)}
                    </div>
                    <h3 className="font-bold text-lg mb-2 truncate" title={review.title}>{review.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 flex-1">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#151194] font-bold uppercase">
                          {review.user ? review.user.charAt(0) : 'U'}
                       </div>
                       <div>
                         <p className="font-semibold text-sm">{review.user || 'Anonymous'}</p>
                         <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                         </p>
                       </div>
                    </div>
                 </div>
               ))
            ) : (
               <div className="col-span-3 text-center py-12 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500">
                 <div className="flex justify-center mb-4">
                    <Star className="w-12 h-12 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-1">No reviews yet</h3>
                 <p>Be the first to share your thoughts about this product!</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}