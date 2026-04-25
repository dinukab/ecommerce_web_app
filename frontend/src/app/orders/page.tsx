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
  Inbox,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Customer Portal</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
            <p className="text-slate-500 mt-2 font-medium">Keep track of all your OneShop purchases in one place.</p>
          </div>
          
          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or tracking..." 
              className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none w-full text-sm font-medium shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-slate-50/50">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No orders found</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
              We couldn't find any orders matching your criteria. Start shopping to build your history!
            </p>
            <Link 
              href="/category/all" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              Discover Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-500 overflow-hidden"
              >
                {/* Order Summary Bar */}
                <div className="p-8 pb-4 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center text-blue-600 ring-1 ring-blue-100 group-hover:scale-110 transition-transform duration-500">
                      <Package className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400 font-mono">
                          ID: {order._id.slice(-8).toUpperCase()}
                        </span>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           {new Date(order.createdAt).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric'
                           })}
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                           <DollarSign className="w-4 h-4 text-slate-400" />
                           LKR {order.totalPrice.toLocaleString()}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link 
                      href={`/orders/${order._id}`}
                      className="flex-1 sm:flex-none px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm flex items-center justify-center gap-2"
                    >
                      Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/track?trackingNumber=${order.trackingNumber}`}
                      className="flex-1 sm:flex-none px-8 py-3.5 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm text-center"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>

                {/* Items Divider */}
                <div className="px-8 py-2">
                  <div className="h-px bg-slate-100 w-full"></div>
                </div>

                {/* Items Strip */}
                <div className="p-8 pt-4 flex items-center justify-between">
                  <div className="flex -space-x-3 overflow-hidden">
                    {order.orderItems.slice(0, 4).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="w-14 h-14 rounded-xl border-4 border-white bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden flex-shrink-0"
                        title={item.name}
                      >
                        <img 
                          src={item.image || 'https://via.placeholder.com/100?text=Product'} 
                          alt={item.name} 
                          className="w-full h-full object-contain p-1" 
                        />
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="w-14 h-14 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 ring-1 ring-slate-100">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-900">
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'} in this order
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Shipped to {order.shippingAddress.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
