'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import { 
  ArrowLeft,
  Truck,
  MapPin,
  ChevronDown,
  ChevronUp,
  Package,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setFilterMode(urlParams.get('filter'));
    }
  }, []);

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

  const toggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (filterMode === 'cancelled' && order.orderStatus !== 'cancelled') {
      return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchId = order._id.toLowerCase().includes(query);
    const matchProduct = order.orderItems?.some(item => 
      item.name.toLowerCase().includes(query)
    );
    return matchId || matchProduct;
  });

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      {/* Simple Header */}
      <div className="bg-[#f4f5f7] border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => {
            if (filterMode) {
              router.push('/profile');
            } else {
              router.back();
            }
          }} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-brand-dark">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {filterMode === 'cancelled' ? 'My Returns & Cancellations' : 'My Orders'}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by order ID or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all shadow-sm text-gray-800 font-medium placeholder:text-gray-400"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found.</p>
            <Link 
              href="/category/all"
              className="mt-6 inline-block bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-[#f8fbf9] rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 pb-4">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-[1.05rem] font-bold text-gray-800 flex items-center gap-1.5">
                      order <span className="text-brand">#{order._id.slice(-6).toLowerCase()}</span>
                    </h3>
                    <p className="text-[0.7rem] text-gray-500 mt-1 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                      })}, {new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  {/* Cancel Button / Status Pill */}
                  {['pending', 'confirmed', 'processing'].includes(order.orderStatus) ? (
                    <Link
                      href={`/orders/cancel/${order._id}`}
                      className="bg-blue-50 text-blue-800 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                    >
                      Cancel
                    </Link>
                  ) : order.orderStatus === 'cancelled' ? (
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                      Cancelled
                    </span>
                  ) : null}
                </div>

                {/* Info Rows */}
                <div className="space-y-4 mb-5 pl-1">
                  <div className="flex items-center gap-5">
                    <Truck className="w-5 h-5 text-brand" strokeWidth={2} />
                    <span className="text-[0.85rem] text-gray-600 font-medium capitalize">
                      {order.paymentMethod === 'cash-on-delivery' ? 'Cash On Delivery' : order.paymentMethod || 'Online Payment'}
                    </span>
                  </div>
                  <div className="flex items-start gap-5">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[0.85rem] text-gray-500 font-medium leading-snug">
                      {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}, {order.shippingAddress?.city}, {order.shippingAddress?.district}, {order.shippingAddress?.postalCode}
                    </span>
                  </div>
                </div>

                {/* Items Accordion Toggle */}
                <button 
                  onClick={() => toggleOrder(order._id)}
                  className="w-full flex items-center justify-between py-4 border-t border-b border-gray-200/60 text-[0.85rem] font-bold text-brand-dark transition-colors"
                >
                  <div className="flex items-center gap-5 pl-1">
                    <Package className="w-5 h-5" strokeWidth={2} />
                    <span>view {order.orderItems?.length || 0} Items</span>
                  </div>
                  {expandedOrder === order._id ? (
                    <ChevronUp className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>

                {/* Expanded Items Area */}
                {expandedOrder === order._id && (
                  <div className="py-4 border-b border-gray-200/60 space-y-4 bg-white/50 px-4 -mx-5">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 pl-1">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 p-1 flex-shrink-0">
                          <img 
                            src={item.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+PC9zdmc+'} 
                            alt={item.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[0.85rem] font-bold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-[0.85rem] font-bold text-gray-800">
                          Rs {item.price?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    {/* Embedded Action Buttons */}
                    <div className="pt-3 flex gap-3 px-1 flex-wrap">
                      <Link 
                        href={`/orders/${order._id}`}
                        className="flex-1 text-center py-2.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors"
                      >
                        Order Summary
                      </Link>
                      <Link 
                        href={`/track?trackingNumber=${order.trackingNumber}`}
                        className="flex-1 text-center py-2.5 bg-white border-2 border-brand-light text-brand-dark hover:bg-brand-light rounded-xl text-xs font-bold transition-colors"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-5 pl-1">
                  <div className="flex items-center gap-5">
                    <Truck className="w-5 h-5 text-brand" strokeWidth={2} />
                    <span className="text-[0.85rem] font-bold text-gray-700">
                      Delivery: <span className="text-brand capitalize">{order.orderStatus === 'pending' && order.paymentStatus === 'paid' ? 'confirmed' : order.orderStatus || 'pending'}</span>
                    </span>
                  </div>
                  <div className="text-[0.85rem] font-bold text-gray-800">
                    Total: <span className="text-brand">Rs {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

