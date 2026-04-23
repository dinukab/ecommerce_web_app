'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { 
  ShoppingBag, 
  Package, 
  ChevronRight, 
  Search,
  Inbox
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await api.getMyOrders(token);
        if (res.success) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track your recent purchases</p>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              placeholder="Search by order ID..." 
              className="pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 text-sm shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Inbox className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">No orders yet</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
              Looks like you haven't placed any orders. Start exploring our amazing collection!
            </p>
            <Link 
              href="/category/all" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              Start Shopping
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Order Meta */}
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'Product' : 'Products'} • LKR {order.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-0 pt-6 md:pt-0">
                    <Link 
                      href={`/orders/${order._id}`}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 text-sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/track?trackingNumber=${order.trackingNumber}`}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                    >
                      Track
                    </Link>
                  </div>
                </div>

                {/* Items Preview Strip */}
                <div className="px-8 pb-8 flex gap-3 overflow-x-auto custom-scrollbar">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0 p-2">
                      <img src={item.image} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                  {order.orderItems.length > 5 && (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                      +{order.orderItems.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
