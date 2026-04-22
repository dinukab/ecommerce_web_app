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

  // Calculate tax (10% of subtotal)
  const taxAmount = Math.round(subtotal * 0.1);
  const finalTotal = subtotal + shipping + taxAmount - appliedDiscount;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-4 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">LKR {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping estimate</span>
          <span className="font-semibold text-gray-900">LKR {shipping.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax estimate</span>
          <span className="font-semibold text-gray-900">LKR {taxAmount.toLocaleString()}</span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount Applied</span>
            <span className="font-semibold">-LKR {appliedDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4"></div>

        {/* Final Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-gray-900">Order Total</span>
          <span className="text-lg font-bold text-blue-600">LKR {finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Promo Code */}
      {!hidePromoCode && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">Apply Promo Code</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 border border-gray-300 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyPromo}
              className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium text-gray-900 text-sm transition-colors"
            >
              Apply
            </button>
          </div>
          {appliedDiscount > 0 && (
            <p className="text-xs text-green-600 mt-2">✓ SAVE10 applied!</p>
          )}
        </div>
      )}

      {/* Checkout Button */}
      {!hideCheckoutButton && (
        <Link href="/cart/checkout">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors mb-4">
            Proceed to Checkout
          </button>
        </Link>
      )}

      {/* Secure Checkout */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>🔒</span>
        <span>Secure Checkout</span>
      </div>

      {/* Payment Icons */}
      <div className="flex justify-center gap-2 mt-3">
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
        <div className="w-10 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
