'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import { 
  CheckCircle2, 
  ShoppingBag,
  Truck,
  Calendar,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function OrderConfirmationPage(props: { params: Promise<{ orderId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const orderId = params.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!orderId || orderId === '[orderId]') {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      const token = localStorage.getItem('auth_token');
      const rawUser = localStorage.getItem('user');
      
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          setUserEmail(user.email || '');
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
        }
      }

      if (!token) return;
      try {
        const res = await api.getOrderById(token, orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md border border-gray-100">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-8 text-sm">We couldn't retrieve the details for this order. It might still be processing.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const estDateStart = new Date(order.estimatedDeliveryDate);
  const estDateEnd = new Date(order.estimatedDeliveryDate);
  estDateEnd.setDate(estDateEnd.getDate() + 1);

  const formatDeliveryRange = (start: Date, end: Date) => {
    const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} - ${e}`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">OneShop</span>
          </Link>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Order Confirmed
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4">Thank You for Your Purchase!</h1>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              Your order has been placed successfully. We've sent a confirmation email to <br />
              <span className="font-bold text-gray-800">{userEmail || 'your email address'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Card: Order Details */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Number</p>
                  <p className="text-base font-black text-gray-900">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date</p>
                  <p className="text-base font-black text-gray-900">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Amount</p>
                  <p className="text-base font-black text-gray-900">LKR {order.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Method</p>
                  <p className="text-base font-black text-gray-900 capitalize">
                    {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Estimated Delivery</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDeliveryRange(estDateStart, estDateEnd)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                    Shipping via {order.deliveryMethod === 'express' ? 'Express Courier' : 'Standard Delivery'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Order Summary */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Order Summary</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{order.orderItems.length} Items</span>
              </div>
              
              <div className="space-y-5 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex-shrink-0 p-2 border border-gray-100 flex items-center justify-center">
                      <img 
                        src={item.image || 'https://placehold.co/200x200?text=Product'} 
                        alt={item.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      Rs.{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-black text-gray-900">
                  Rs.{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 text-center space-y-6">
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500 font-medium">
                Need help with your order? <Link href="/contact" className="text-blue-600 font-bold hover:underline">Contact Support</Link>
              </p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                All transactions are secure and encrypted.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">© 2026 OneShop Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-gray-400 font-bold hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-gray-400 font-bold hover:text-gray-600">Terms of Service</Link>
            <Link href="/returns" className="text-xs text-gray-400 font-bold hover:text-gray-600">Returns</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e2e2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d1d1;
        }
      `}</style>
    </div>
  );
}