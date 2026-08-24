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
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';

const PLACEHOLDER = 'https://placehold.co/600x600/f8fafc/6366f1?text=No+Image';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
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

      // Check if item is wishlisted
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const wishlistRes = await api.getWishlist(token);
          if (wishlistRes.success && wishlistRes.data?.products) {
            const isWl = wishlistRes.data.products.some((p: any) => p._id === id);
            setIsWishlisted(isWl);
          }
        } catch (e) {
          console.error('Error fetching wishlist', e);
        }
      }
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

  const handleWishlist = async () => {
    if (!product) return;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to add to wishlist');
      router.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.removeFromWishlist(token, product._id);
        setIsWishlisted(false);
      } else {
        await api.addToWishlist(token, product._id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error || !product) return <div className="p-20 text-center">{error}</div>;

  const discount = product.costPrice && product.costPrice > product.sellingPrice 
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
              <button 
                onClick={handleWishlist}
                className="absolute top-4 right-4 text-gray-300 transition-colors z-10 group/heart"
              >
                <Heart 
                  size={24} 
                  className={`transition-colors ${
                    isWishlisted 
                      ? 'text-red-500 fill-red-500' 
                      : 'group-hover/heart:text-red-500 group-hover/heart:fill-red-500'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex gap-3">
              {product.images?.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-gray-50 p-1 ${activeImage === i ? 'border-brand' : 'border-transparent'}`}
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
              <span className="text-brand font-bold">
                {product.rating} ({product.numReviews.toLocaleString()} Reviews)
              </span>
            </div>

            {/* Price & Unit Display */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                Rs {product.sellingPrice.toLocaleString()}
                {(product.isWeightBased || product.unit === 'kg' || product.name.toLowerCase().includes('/kg') || product.name.toLowerCase().includes('(kg)')) && (
                  <span className="text-lg font-normal text-gray-500"> / kg</span>
                )}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-300 line-through">Rs {(product.costPrice ?? 0).toLocaleString()}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">SAVE {discount}%</span>
                </>
              )}
            </div>

            {(product.isWeightBased || product.unit === 'kg' || product.name.toLowerCase().includes('/kg') || product.name.toLowerCase().includes('(kg)')) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-4 w-fit border border-amber-200">
                ⚖️ Sold by weight (Select in grams/kg)
              </span>
            )}

            {product.expiryDate && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full mb-4 w-fit border border-rose-200 shadow-sm">
                <span>📅</span> Expiry Date: {new Date(product.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            )}

            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
              {product.description || `Premium quality ${product.name} for your daily needs. Sourced from the best suppliers to ensure freshness and taste.`}
            </p>

            <div className="space-y-6">
              {/* Weight Selector for Weight-Based Products */}
              {(product.isWeightBased || product.unit === 'kg' || product.name.toLowerCase().includes('/kg') || product.name.toLowerCase().includes('(kg)')) ? (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Weight:</span>
                    <span className="text-xs font-bold text-brand bg-brand-light/50 px-2.5 py-1 rounded-lg">
                      Selected: {quantity >= 1 ? `${quantity} kg` : `${Math.round(quantity * 1000)}g`}
                    </span>
                  </div>

                  {/* Preset Weight Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { weight: 0.25, label: '250g' },
                      { weight: 0.5, label: '500g' },
                      { weight: 1, label: '1 kg' },
                      { weight: 1.5, label: '1.5 kg' },
                      { weight: 2, label: '2 kg' },
                      { weight: 3, label: '3 kg' },
                      { weight: 5, label: '5 kg' },
                    ].map((preset) => (
                      <button
                        key={preset.weight}
                        type="button"
                        onClick={() => setQuantity(preset.weight)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          quantity === preset.weight
                            ? 'bg-[#151194] text-white border-[#151194] shadow-md scale-105'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand hover:text-brand'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Fine Weight Adjuster */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <span className="text-xs text-gray-500">Adjust weight (±250g):</span>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(0.25, Number((quantity - 0.25).toFixed(2))))}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand font-bold"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-16 text-center font-bold text-xs text-gray-900">
                        {quantity >= 1 ? `${quantity} kg` : `${Math.round(quantity * 1000)}g`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Number((quantity + 0.25).toFixed(2)))}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand font-bold"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Calculated Price Display */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 font-bold text-sm">
                    <span className="text-gray-700">Total Price:</span>
                    <span className="text-xl text-brand">
                      Rs {(product.sellingPrice * quantity).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : (
                /* Unit Quantity Selector */
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
                </div>
              )}

              <button 
                onClick={() => addToCart(product, quantity)}
                className="w-full h-13 bg-[#151194] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#0c0a5c] shadow-lg shadow-brand-light transition-all active:scale-98"
              >
                <ShoppingCart size={18} />
                Add {(product.isWeightBased || product.unit === 'kg') ? (quantity >= 1 ? `${quantity} kg` : `${Math.round(quantity * 1000)}g`) : `${quantity} item(s)`} to Cart — Rs {(product.sellingPrice * quantity).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </button>
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
              className="bg-[#151194] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-brand-light hover:bg-[#0c0a5c] transition-all flex items-center gap-2"
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
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light0"
                  />
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-gray-400">Rating:</span>
                    <select 
                      value={newReview.rating}
                      onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                      className="text-sm font-bold text-brand bg-transparent focus:outline-none"
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
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light0"
                />
                <textarea 
                  placeholder="Share your thoughts about this product..." 
                  required
                  rows={4}
                  value={newReview.text}
                  onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light0"
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
                    <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-indigo-400">
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
