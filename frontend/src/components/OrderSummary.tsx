'use client';

import { useState } from 'react';
import Link from "next/link";

type Props = {
  subtotal: number;
  shipping: number; 
  orderTotal: number;
  cartItems?: any[]; // optional
  hideCheckoutButton?: boolean;
  hidePromoCode?: boolean;
};

export default function OrderSummary({
  subtotal,
  shipping,
  orderTotal,
  hideCheckoutButton = false,
  hidePromoCode = false,
}: Props) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setAppliedDiscount(Math.round(subtotal * 0.1));
      alert('Promo code SAVE10 applied! 🎉');
    } else {
      alert('Invalid promo code');
    }
  };

  const finalTotal = orderTotal - appliedDiscount;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md sticky top-6 border border-slate-200">
      <h2 className="text-xl font-bold text-black mb-5">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-800">Rs.{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Shipping estimate</span>
          <span className="font-semibold text-slate-800">Rs.{shipping.toLocaleString()}</span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount Applied</span>
            <span className="font-semibold">-Rs.{appliedDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Promo Code */}
        {!hidePromoCode && (
          <div className="pt-2">
            <div className="text-sm font-semibold text-slate-700 mb-2">Apply Promo Code</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border bg-slate-100 border-slate-400 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyPromo}
                className="px-5 py-2 bg-slate-100 border border-slate-400 rounded-xl hover:bg-slate-200 font-medium text-slate-900 text-sm"
              >
                Apply
              </button>
            </div>
            {appliedDiscount > 0 && (
              <p className="text-xs text-green-600 mt-1">✓ SAVE10 applied!</p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4 mt-4"></div>

        {/* Final Total */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-black text-base">Order Total</span>
          <span className="text-xl font-bold text-[#151194]">Rs.{finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout Button */}
      {!hideCheckoutButton && (
        <Link href="/cart/checkout">
          <button className="mt-6 w-full bg-[#151194] hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-sm transition ">
            Proceed to Checkout
          </button>
        </Link>
      )}

      {/* Secure Checkout */}
      <div className="flex items-center justify-center gap-1 mt-4 text-xs text-slate-500">
        <span>🔒</span>
        <span>Secure Checkout</span>
      </div>

      {/* Payment Icons */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
