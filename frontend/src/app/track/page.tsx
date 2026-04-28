'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, OrderTracking } from '@/lib/api';
import OrderTimeline from '@/components/OrderTimeline';
import { 
  Search, 
  Truck, 
  Calendar, 
  MapPin, 
  Package, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams?.get('trackingNumber') || '');
  const [trackingData, setTrackingData] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await api.trackOrder(trackingNumber);
      if (res.success) {
        setTrackingData(res.data ?? null);
      } else {
        setError(res.message || 'Tracking number not found');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to track this order. Please check the tracking number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams?.get('trackingNumber')) {
      handleTrack();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      {/* Tracking Search Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand text-white shadow-xl shadow-brand-light mb-6">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter your tracking number (e.g. OS240423XYZ) to see your order's real-time status.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleTrack} className="relative max-w-xl mx-auto mb-16">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="Enter Tracking Number..."
            className="w-full pl-16 pr-32 py-6 rounded-[2rem] border-2 border-white bg-white shadow-2xl shadow-brand-light/50 focus:border-brand-light0 outline-none transition-all text-lg font-bold text-gray-900 placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3.5 bg-brand text-white font-black rounded-[1.5rem] hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-bold justify-center">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </form>

      {/* Tracking Results */}
      {trackingData && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            {/* Header info */}
            <div className="p-8 md:p-12 border-b border-gray-50 bg-linear-to-br from-white to-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest px-2.5 py-1 bg-brand-light rounded-lg border border-brand-light">
                      Live Status
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      Tracking: {trackingData.trackingNumber}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 capitalize">
                    {trackingData.status}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                    <p className="text-xl font-black text-brand">
                      {new Date(trackingData.estimatedDeliveryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-8 md:p-12">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-10 text-center">Delivery Roadmap</h3>
              <OrderTimeline status={trackingData.status} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                    <p className="text-sm font-bold text-gray-900">{trackingData.city}, {trackingData.district}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Package Info</p>
                    <p className="text-sm font-bold text-gray-900">{trackingData.itemsCount} Items Secured</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(trackingData.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="bg-gray-50 p-6 flex items-center justify-center gap-3">
              <Clock className="w-4 h-4 text-brand-light0" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Last updated: Just now
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Info if no data */}
      {!trackingData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Clock, title: 'Real-time Updates', desc: 'Get the latest status of your package as it moves.' },
            { icon: Truck, title: 'Secure Handling', desc: 'Your items are tracked with high security standards.' },
            { icon: Package, title: 'Detailed Logs', desc: 'See every step from our warehouse to your door.' }
          ].map((item, i) => (
            <div key={i} className="p-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <item.icon className="w-6 h-6 text-brand" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}

