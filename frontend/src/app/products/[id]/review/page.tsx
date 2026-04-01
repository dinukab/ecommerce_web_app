"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ChevronLeft } from "lucide-react";

export default function WriteReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcode product name for mock UI since we aren't fetching it here to keep things simple
  const productName = "Wireless Headphones";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Review submitted successfully! (Mock Action)");
      router.push(`/products/${id}`);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 mb-20 text-gray-800">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-[#151194] transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Product
      </button>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Write a Review</h1>
          <p className="text-gray-500">Share your thoughts about the <span className="font-semibold">{productName}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Rating Section */}
          <div className="flex flex-col items-center justify-center space-y-4 pb-8 border-b border-gray-100">
            <label className="text-lg font-semibold text-gray-700">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm font-medium text-[#151194]">
                {rating === 1 ? "1 Star - Poor" : rating === 2 ? "2 Stars - Fair" : rating === 3 ? "3 Stars - Good" : rating === 4 ? "4 Stars - Very Good" : "5 Stars - Excellent"}
              </span>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-semibold text-gray-700">Review Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience in a few words"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#151194] focus:ring-2 focus:ring-[#151194]/20 outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="text" className="font-semibold text-gray-700">Detailed Review</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did you like or dislike? Would you recommend this product?"
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#151194] focus:ring-2 focus:ring-[#151194]/20 outline-none transition-all placeholder:text-gray-400 resize-y"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#151194] hover:bg-[#0c0a5c] shadow-lg shadow-[#151194]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
