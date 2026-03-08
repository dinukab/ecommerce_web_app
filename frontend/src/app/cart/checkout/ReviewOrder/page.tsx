'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit2 } from 'lucide-react';

type CheckoutData = {
  email: string;
  emailOffers: boolean;
  fullName: string;
  province: string;
  phoneNumber: string;
  district: string;
  buildingAddress: string;
  city: string;
  colonyLocality: string;
  address: string;
  cardNumber: string;
  nameOnCard: string;
  expirationDate: string;
  cvc: string;
};

type OrderTotals = {
  subtotal: number;
  shipping: number;
  orderTotal: number;
};

type CartItem = {
  id: string;
  name: string;
  details: string;
  status: "in-stock" | "low-stock" | "out-stock";
  price: number;
  quantity: number;
  total: number;
};

export default function ReviewOrderPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [orderTotals, setOrderTotals] = useState<OrderTotals | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const savedCheckout = localStorage.getItem('checkoutData');
    const savedTotals = localStorage.getItem('orderTotals');
    const savedCart = localStorage.getItem('checkoutCartItems');

    if (savedCheckout) {
      setCheckoutData(JSON.parse(savedCheckout));
    }
    if (savedTotals) {
      setOrderTotals(JSON.parse(savedTotals));
    }
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const handlePlaceOrder = () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    
    // Here you would typically send the order to your backend
    console.log('Order placed:', {
      checkoutData,
      orderTotals,
      cartItems
    });
    
    // Clear localStorage after order
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('orderTotals');
    localStorage.removeItem('checkoutCartItems');
    
    alert('Order placed successfully!');
    router.push('/');
  };

  const handleChangePayment = () => {
    router.push('/cart/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!checkoutData || !orderTotals) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">No order data found. Please complete checkout.</p>
          <div className="text-center mt-6">
            <Link href="/cart/checkout" className="text-blue-600 hover:underline">
              Back to Checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Review your order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">

            {/* Shipping Address */}
            
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Shipping Address</h2>
                <button
                  onClick={handleChangePayment}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={14} />
                  Change
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>{checkoutData.fullName}</p>
                <p>{checkoutData.buildingAddress}</p>
                <p>{checkoutData.colonyLocality}</p>
                <p>{checkoutData.city}, {checkoutData.district}</p>
                <p>{checkoutData.province}</p>
                <p>{checkoutData.phoneNumber}</p>
              </div>
            

            {/* Payment Method */}
            
              <div className="flex justify-between items-start mb-4 mt-9">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <button
                  onClick={handleChangePayment}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Edit2 size={14} />
                  Change
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">Visa ending in {checkoutData.cardNumber.slice(-4)}</p>
                  <p>Expires {checkoutData.expirationDate}</p>
                </div>
              </div>
            
            </div>


            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </a>
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . Your personal data will be used to process your order, support your experience
                  throughout this website, and for other purposes described in our privacy policy.
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/cart/checkout')}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                <ChevronLeft size={18} />
                Back to Payment
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!agreedToTerms}
                className="flex-1 px-6 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                Place Order
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-5">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-gray-600">Qty {item.quantity}</p>
                      <p className="font-semibold text-gray-800">Rs.{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs.{orderTotals.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Rs.{orderTotals.shipping.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">Rs.0</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3"></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-xl font-bold text-blue-900">Rs.{orderTotals.orderTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                  <span>🔒</span>
                  <span>Transactions are encrypted and secure</span>
                </div>
                <div className="text-xs text-center text-gray-500">
                  <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
