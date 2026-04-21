'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Truck, 
  RotateCcw,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { fetchProductById, type Product } from '@/api/Productapi';
import { fetchProductReviews, submitReview, type Review } from '@/api/Reviewapi';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER = 'https://placehold.co/600x600/f8fafc/6366f1?text=No+Image';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, title: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [prodData, reviewData] = await Promise.all([
        fetchProductById(id as string),
        fetchProductReviews(id as string)
      ]);
      setProduct(prodData);
      setReviews(reviewData);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      setSubmitting(true);
      await submitReview(product._id, newReview);
      setShowReviewForm(false);
      setNewReview({ user: '', rating: 5, title: '', text: '' });
      await loadData(); // Refresh reviews
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error || !product) return <div className="p-20 text-center">{error}</div>;

  const discount = product.costPrice > product.sellingPrice 
    ? Math.round(((product.costPrice - product.sellingPrice) / product.costPrice) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] text-gray-400 mb-8 font-medium">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/category/all">{product.category}</Link>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          
          {/* Left: Images */}
          <div>
            <div className="aspect-square bg-[#f8fafc] rounded-2xl overflow-hidden border border-gray-100 mb-4 relative">
              <img 
                src={product.images?.[activeImage] || PLACEHOLDER} 
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#151194] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  {product.badge}
                </span>
              )}
              <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            
            <div className="flex gap-3">
              {product.images?.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-gray-50 p-1 ${activeImage === i ? 'border-indigo-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col py-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6 text-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />)}
              </div>
              <span className="text-indigo-600 font-bold">
                {product.rating} ({product.numReviews.toLocaleString()} Reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">Rs {product.sellingPrice.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-300 line-through">Rs {product.costPrice.toLocaleString()}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">SAVE {discount}%</span>
                </>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              {product.description || `Premium quality ${product.name} for your daily needs. Sourced from the best suppliers to ensure freshness and taste.`}
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-400"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-400"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 h-12 bg-[#151194] text-white rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#0c0a5c] transition-all"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                  <Truck size={16} className="text-[#151194]" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                  <RotateCcw size={16} className="text-[#151194]" />
                  30 Day Returns
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Reviews Section */}
        <div className="border-t border-gray-100 pt-16 mb-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <p className="text-gray-500 text-xs">Based on {reviews.length} verified ratings</p>
            </div>
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#151194] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-[#0c0a5c] transition-all flex items-center gap-2"
            >
              <MessageSquare size={14} />
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-gray-900 mb-6">Write Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required
                    value={newReview.user}
                    onChange={(e) => setNewReview({...newReview, user: e.target.value})}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-gray-400">Rating:</span>
                    <select 
                      value={newReview.rating}
                      onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                      className="text-sm font-bold text-indigo-600 bg-transparent focus:outline-none"
                    >
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Review Title" 
                  required
                  value={newReview.title}
                  onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea 
                  placeholder="Share your thoughts about this product..." 
                  required
                  rows={4}
                  value={newReview.text}
                  onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="bg-[#151194] text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0c0a5c] disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r._id} className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-3">"{r.title}"</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1 italic">
                    {r.text}
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <UserIcon size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-900">{r.user}</p>
                      <p className="text-[9px] text-emerald-500 font-bold">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
