'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import { 
  ArrowLeft, 
  Copy, 
  Truck, 
  MapPin, 
  CreditCard, 
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <Link 
            href="/orders" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => copyToClipboard(order.trackingNumber)}
              className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand-light flex items-center gap-2"
            >
              {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? 'Copied!' : 'Copy Tracking Number'}
            </button>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h1>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Placing on {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Estimated Delivery: <span className="font-bold text-gray-900">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-light rounded-2xl border border-brand-light flex flex-col justify-center">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">Tracking Number</p>
              <div className="flex items-center gap-4">
                <code className="text-xl font-black text-brand-dark">{order.trackingNumber}</code>
                <button 
                  onClick={() => copyToClipboard(order.trackingNumber)}
                  className="p-2 rounded-lg bg-white text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
                >
                  {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-50">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 text-center">Delivery Progress</h3>
            <OrderTimeline status={order.orderStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items & Price Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Order Items</h2>
              <div className="space-y-6">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 p-3 border border-gray-100 flex-shrink-0">
                      <img 
                        src={item.image || 'https://placehold.co/200x200?text=Product'} 
                        alt={item.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-1">Price: LKR {item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-400">x{item.quantity}</p>
                      <p className="text-base font-black text-gray-900">LKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-dashed border-gray-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items Subtotal</span>
                  <span className="font-bold text-gray-900">LKR {order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee ({order.deliveryMethod})</span>
                  <span className="font-bold text-gray-900">LKR {order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-50">
                  <span className="text-lg font-bold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-black text-brand">LKR {order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="space-y-8">
            {/* Shipping Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                  <Truck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Shipping Info</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</p>
                  <p className="text-sm font-bold text-gray-800">{order.shippingAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {order.shippingAddress.addressLine1},<br />
                    {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2},<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.district},<br />
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-bold text-gray-800">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Payment Info</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Method</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{order.paymentMethod.replace(/-/g, ' ')}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
