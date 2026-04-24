'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import OrderSummary from '@/components/OrderSummary';
import { 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  Building2, 
  LocateFixed, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
].sort();

export default function CheckoutPage() {
  const { cart, clearCart, getCartTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryData, setDeliveryData] = useState({ fee: 0, days: 0 });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cash-on-delivery',
    orderNotes: ''
  });

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);

  const subtotal = useMemo(() => getCartTotal(), [cart, getCartTotal]);

  useEffect(() => {
    const calculateFee = async () => {
      if (!formData.district) return;
      try {
        const res = await api.calculateDeliveryFee({ 
          district: formData.district, 
          deliveryMethod: formData.deliveryMethod 
        });
        if (res.success) {
          setDeliveryData({ fee: res.data.fee, days: res.data.estimatedDays });
        }
      } catch (err) {
        console.error('Fee calculation error:', err);
      }
    };
    calculateFee();
  }, [formData.district, formData.deliveryMethod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      const orderData = {
        orderItems: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.sellingPrice,
          image: item.images?.[0] || ''
        })),
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          phone: formData.phone
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        orderNotes: formData.orderNotes
      };

      const res = await api.createOrder(token, orderData);
      if (res.success) {
        clearCart();
        router.push(`/orders/confirmation/${res.data._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
            <p className="text-sm text-gray-500">Complete your order details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Form Sections */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Contact Information */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <User className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Mail className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Phone className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 7X XXX XXXX"
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Shipping Address */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address Line 1</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Building2 className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="Street name, building number..."
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address Line 2 (Optional)</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Building2 className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">District</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all relative">
                    <LocateFixed className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      required
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute right-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">City</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <input
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter City"
                      className="w-full px-5 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Postal Code</label>
                  <div className="flex items-center rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <input
                      required
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="E.g. 10000"
                      className="w-full px-5 py-3.5 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Delivery & Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Method</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'standard', label: 'Standard Delivery', desc: 'Normal transit time' },
                    { id: 'express', label: 'Express Delivery', desc: 'Faster delivery (+50% fee)' },
                    { id: 'pickup', label: 'Store Pickup', desc: 'Pick up at store (FREE)' }
                  ].map((m) => (
                    <label 
                      key={m.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.deliveryMethod === m.id 
                          ? 'border-blue-600 bg-blue-50/50' 
                          : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={m.id}
                          checked={formData.deliveryMethod === m.id}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{m.label}</p>
                          <p className="text-[10px] text-gray-500">{m.desc}</p>
                        </div>
                      </div>
                      {formData.deliveryMethod === m.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'cash-on-delivery', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Secure online payment' },
                    { id: 'bank-transfer', label: 'Bank Transfer', desc: 'Manual bank deposit' }
                  ].map((p) => (
                    <label 
                      key={p.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === p.id 
                          ? 'border-blue-600 bg-blue-50/50' 
                          : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={p.id}
                          checked={formData.paymentMethod === p.id}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{p.label}</p>
                          <p className="text-[10px] text-gray-500">{p.desc}</p>
                        </div>
                      </div>
                      {formData.paymentMethod === p.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Additional Notes */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-4">Order Notes (Optional)</label>
              <textarea
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special instructions for delivery..."
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-8">
            <OrderSummary 
              items={cart} 
              deliveryFee={deliveryData.fee} 
              subtotal={subtotal} 
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Place Order Now</span>
                  <CheckCircle2 className="w-6 h-6" />
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
              Guaranteed Secure Checkout
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
