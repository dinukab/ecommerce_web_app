'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  ArrowRight,
  ShoppingBag,
  MapPin,
  ClipboardCheck
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('auth_token');
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
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-8">We couldn't retrieve the details for this order.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Thank you for shopping with OneShop. Your order has been placed successfully and is being processed.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-brand p-8 text-white">
            <div className="flex flex-wrap justify-between gap-6">
              <div>
                <p className="text-brand-light text-xs font-bold uppercase tracking-widest mb-1">Order Number</p>
                <p className="text-2xl font-black">{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-brand-light text-xs font-bold uppercase tracking-widest mb-1">Tracking Number</p>
                <p className="text-2xl font-black">{order.trackingNumber}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Delivery</p>
                  <p className="text-sm font-black text-gray-900">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Method</p>
                  <p className="text-sm font-black text-gray-900 uppercase">
                    {order.deliveryMethod} Shipping
                  </p>
                </div>
              </div>
            </div>

            {/* Address & Items Preview */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900">Delivery Address</h3>
              </div>
              <div className="pl-8">
                <p className="text-sm font-bold text-gray-800">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.district}
                </p>
                <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">Items Ordered</h3>
                  <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="space-y-4">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 p-2 border border-gray-100">
                        <img 
                          src={item.image || 'https://placehold.co/200x200?text=Product'} 
                          alt={item.name} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} x LKR {item.price.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-black text-brand">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-8 border-t border-dashed border-gray-200 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-3xl font-black text-gray-900">LKR {order.totalPrice.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Payment Status</p>
                <p className="text-sm font-black text-emerald-700 uppercase tracking-wider">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href={`/track?trackingNumber=${order.trackingNumber}`} 
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-brand text-white font-black rounded-3xl hover:bg-brand-dark shadow-xl shadow-brand-light transition-all active:scale-95"
          >
            <ClipboardCheck className="w-6 h-6" />
            Track Order
          </Link>
          <Link 
            href="/category/all" 
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-white text-gray-900 font-black rounded-3xl border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
          >
            <ShoppingBag className="w-6 h-6" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}