'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order, OrderItem } from '@/lib/api';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

const CANCEL_REASONS = [
  'want to place a new order with more/different items',
  'Delivery time is too long',
  'Duplicate order',
  'Change of Delivery Address',
  'Shipping costs is too hight',
  'Dont want this order/item anymore',
  'Forgot to use voucher/promo',
  'Decided for alternative product',
  'Seller asked me to cancel/informed that item is out of stock',
  'Found cheaper elsewhere',
  'Other',
];

interface CancelItem extends OrderItem {
  selected: boolean;
  cancelQty: number;
}

export default function RequestCancellationPage(props: { params: Promise<{ orderId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [cancelItems, setCancelItems] = useState<CancelItem[]>([]);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const MAX_CHARS = 256;

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await api.getOrderById(token, orderId);
        if (res.success && res.data) {
          setOrder(res.data);
          setCancelItems(
            res.data.orderItems.map(item => ({
              ...item,
              selected: true,
              cancelQty: item.quantity,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  const toggleItem = (index: number) => {
    setCancelItems(prev =>
      prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item)
    );
  };

  const updateQty = (index: number, delta: number) => {
    setCancelItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.min(Math.max(1, item.cancelQty + delta), item.quantity);
        return { ...item, cancelQty: newQty };
      })
    );
  };

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a cancellation reason.'); return; }
    const selectedItems = cancelItems.filter(i => i.selected);
    if (selectedItems.length === 0) { setError('Please select at least one item to cancel.'); return; }
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await api.cancelOrder(token, orderId, {
        cancelReason: reason,
        additionalInfo: additionalInfo || undefined,
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Failed to submit cancellation request.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 max-w-md">
          <XCircle className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <Link href="/orders" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancellable = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

  if (order.orderStatus === 'cancelled' || submitted) {
    const cancelledDate = (order as any).cancelledAt ? new Date((order as any).cancelledAt) : new Date();
    const displayReason = (order as any).cancelReason || reason || 'Requested by user';
    const itemsToShow = submitted ? cancelItems.filter(i => i.selected) : order.orderItems;

    const formatDate = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const dateStr = formatDate(cancelledDate);

    return (
      <div className="min-h-screen bg-[#f4f6f9] pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-xl text-gray-800 mb-6">Cancellation Details</h1>
          
          <div className="bg-white border rounded-xl border-gray-200 shadow-sm mb-4 py-4 px-5">
            <p className="text-sm text-gray-800 mb-1">Canceled on {dateStr}</p>
            <p className="text-sm text-gray-800">Order <span className="text-brand">#{order.orderId || order._id.slice(-8).toUpperCase()}</span></p>
          </div>

          <div className="bg-white border rounded-2xl border-gray-200 shadow-sm p-5">
            <div className="bg-gray-100/70 border border-gray-200 rounded p-3 mb-6 text-sm text-gray-700 flex gap-4">
              <span className="text-gray-500 whitespace-nowrap">{dateStr}</span>
              <span>{order.orderStatus === 'cancelled' ? 'Cancellation of your order is complete' : 'Cancellation of your item is in process'}</span>
            </div>

            <div className="space-y-6">
              {itemsToShow.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center relative overflow-hidden bg-white border border-gray-100 p-1">
                    <img 
                      src={item.image || 'https://placehold.co/100x100?text=Prod'} 
                      alt={item.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="pr-4 max-w-lg">
                      <p className="text-sm text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-2">Reason: {displayReason}</p>
                    </div>
                    <div className="flex gap-16 text-sm text-gray-800 whitespace-nowrap">
                      <span>Rs. {item.price.toLocaleString()}</span>
                      <span className="text-gray-500">Qty: {submitted ? (item as any).cancelQty || item.quantity : item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-none">Request Cancellation</h1>
            <p className="text-[0.7rem] text-gray-400 font-medium mt-0.5">
              Order #{order.orderId || order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Not cancellable warning */}
        {!isCancellable && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Cannot Cancel This Order</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Orders with status <span className="font-bold capitalize">{order.orderStatus}</span> cannot be cancelled. Please contact support for assistance.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Choose items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Choose the item(s) you want to cancel</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cancelItems.map((item, idx) => (
              <div key={idx} className="px-5 py-4 flex items-center gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => isCancellable && toggleItem(idx)}
                  disabled={!isCancellable}
                  className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                    item.selected
                      ? 'bg-brand border-brand'
                      : 'bg-white border-gray-300'
                  } ${!isCancellable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand/60'}`}
                  aria-label={`Toggle ${item.name}`}
                >
                  {item.selected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z"/>
                    </svg>
                  )}
                </button>

                {/* Product Image */}
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex-shrink-0">
                  <img
                    src={item.image || 'https://placehold.co/100x100?text=Prod'}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Name & Price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Rs {item.price.toLocaleString()}</p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => isCancellable && updateQty(idx, -1)}
                    disabled={!isCancellable || item.cancelQty <= 1}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-black text-gray-800">{item.cancelQty}</span>
                  <button
                    onClick={() => isCancellable && updateQty(idx, 1)}
                    disabled={!isCancellable || item.cancelQty >= item.quantity}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg leading-none"
                  >
                    +
                  </button>
                </div>

                {/* Reason Dropdown — visible on sm+ screens, beside each item */}
                <div className="relative w-36 flex-shrink-0 hidden sm:block">
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    disabled={!isCancellable}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select a Reason</option>
                    {CANCEL_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason dropdown for mobile */}
        <div className="sm:hidden bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              disabled={!isCancellable}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 cursor-pointer"
            >
              <option value="">Select a Reason</option>
              {CANCEL_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Section 2: Additional Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
          <h2 className="text-sm font-black text-gray-900">
            Additional Information <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </h2>
          <textarea
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value.slice(0, MAX_CHARS))}
            disabled={!isCancellable}
            rows={4}
            placeholder="Eg. My phone has missing headphones"
            className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none disabled:opacity-50 transition-colors"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400 font-medium">{additionalInfo.length}/{MAX_CHARS}</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Section 3: Cancellation Policy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black text-gray-900">Cancellation Policy</h2>
          </div>
          <div className="px-5 py-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-800 mb-3 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Before cancelling the order, kindly read thoroughly our following terms &amp; conditions:
              </p>
              <ol className="space-y-2.5 list-decimal list-inside">
                <li className="text-xs text-amber-700 leading-relaxed">
                  We will be <strong>unable to retrieve your order</strong> once it is cancelled.
                </li>
                <li className="text-xs text-amber-700 leading-relaxed">
                  Once you confirm your item(s) cancellation, we will process your <strong>refund within 24 hours</strong>, provided the item(s) has not been handed over to the logistics partner yet. Please note that, if your item has already been handed over to the logistics partner we will be <strong>unable to proceed</strong> with your cancellation request and we will inform you accordingly.
                </li>
                <li className="text-xs text-amber-700 leading-relaxed">
                  If you are cancelling your order partially, ie. not all the items in your order, then we will be <strong>unable to refund you the shipping fee</strong>.
                </li>
                <li className="text-xs text-amber-700 leading-relaxed">
                  Once your item(s) has been successfully cancelled you will receive a <strong>notification</strong> from us with your refund summary.
                </li>
              </ol>
            </div>
            <div className="mt-4 bg-[#f4f6f9] rounded-xl p-4 border border-gray-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="policyAccept"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="w-4 h-4 text-brand bg-white border-gray-300 rounded focus:ring-brand focus:ring-2 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="policyAccept" className="text-sm text-gray-700 font-medium cursor-pointer">
                I have read and accepted the Cancellation Policy of OneShop.
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isCancellable && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              Keep My Order
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !policyAccepted}
              className="flex-1 py-3.5 bg-brand text-white rounded-[30px] font-bold text-sm hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Submit Cancellation
                </>
              )}
            </button>
          </div>
        )}

        {!isCancellable && (
          <div className="flex justify-center pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-colors"
            >
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
