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
  Search,
  Store
} from 'lucide-react';
import { storeConfig } from '@/lib/storeConfig';
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
    <>
      <div className="space-y-5">
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
            <div key={order._id} className="bg-white rounded-[0.5rem] shadow-sm border border-gray-200 overflow-hidden mb-4">
              {/* Store Name and Status Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-800 text-[0.95rem]">{storeConfig.storeName}</span>
                </div>
                <span className={`text-[0.75rem] font-bold px-3 py-1 rounded-full capitalize ${order.orderStatus === 'cancelled' ? 'bg-gray-100 text-gray-700' : order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                  {order.orderStatus === 'pending' && order.paymentStatus === 'paid' ? 'confirmed' : order.orderStatus || 'pending'}
                </span>
              </div>

              {/* Items List */}
              <div className="flex flex-col">
                {(order.orderItems || order.items || [])?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <Link href={`/orders/${order._id}`} className="flex-shrink-0 block">
                      <div className="w-20 h-20 rounded-md bg-gray-50 border border-gray-200 p-1">
                        <img 
                          src={item.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+PC9zdmc+'} 
                          alt={item.name} 
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-6">
                      <Link href={`/orders/${order._id}`} className="flex-1 block">
                        <p className="text-[0.95rem] text-gray-800 line-clamp-2 hover:text-brand transition-colors">{item.name}</p>
                      </Link>
                      <div className="flex gap-12 items-center flex-shrink-0">
                        <div className="text-[0.95rem] text-gray-800 w-24">
                          Rs. {item.price?.toLocaleString()}
                        </div>
                        <div className="text-[0.95rem] text-gray-600 w-16 font-medium">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

