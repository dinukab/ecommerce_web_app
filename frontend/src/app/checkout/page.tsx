'use client';

declare global {
  interface Window {
    payhere: any;
  }
}

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { validateSriLankanPhone } from '@/lib/utils';
import { provinces } from '@/data/sri-lanka-locations';
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
  AlertCircle,
  Lock,
  Calendar
} from 'lucide-react';

// Flatten all districts from provinces data
const ALL_DISTRICTS = provinces
  .flatMap(p => p.districts)
  .filter((d, i, arr) => arr.findIndex(x => x.value === d.value) === i) // deduplicate
  .sort((a, b) => a.label.localeCompare(b.label));

// Get cities for a selected district value
const getCitiesForDistrict = (districtValue: string) => {
  for (const province of provinces) {
    const district = province.districts.find(d => d.value === districtValue);
    if (district) return district.cities;
  }
  return [];
};

const CITY_POSTAL_CODES: Record<string, string> = {
  // Colombo
  "colombo city": "00100",
  "fort": "00100",
  "dehiwala": "10350",
  "moratuwa": "10400",
  "sri jayawardenepura kotte": "10100",
  "maharagama": "10280",
  "kolonnawa": "10600",
  "nugegoda": "10250",
  "rajagiriya": "10100",
  "battaramulla": "10120",
  "mount lavinia": "10370",
  "malabe": "10570",
  "kaduwela": "10640",
  "hanwella": "10520",
  "homagama": "10200",
  "kottawa": "10230",
  "piliyandala": "10300",
  "ratmalana": "10390",
  "wellawatte": "00600",
  "borella": "00800",
  "havelock town": "00500",
  "kirulapone": "00500",
  "narahenpita": "00500",
  "dematagoda": "00900",
  "cinnamon gardens": "00700",
  "kollupitiya": "00300",
  "bambalapitiya": "00400",
  "wellampitiya": "10620",
  "mulleriyawa": "10620",
  "awissawella": "10700",
  "padukka": "10500",

  // Gampaha
  "gampaha city": "11000",
  "negombo": "11500",
  "katunayake": "11450",
  "ja-ela": "11350",
  "wattala": "11300",
  "kelaniya": "11600",
  "kiribathgoda": "11600",
  "kadawatha": "11850",
  "ragama": "11010",
  "kandana": "11320",
  "seeduwa": "11410",
  "minuwangoda": "11550",
  "veyangoda": "11100",

  // Kalutara
  "kalutara": "12000",
  "panadura": "12500",
  "horana": "12400",
  "aluthgama": "12080",
  "bandaragama": "12530",
  "wadduwa": "12560",
  "matugama": "12100",
  "beruwala": "12070",

  // Kandy
  "kandy city": "20000",
  "peradeniya": "20400",
  "katugastota": "20800",
  "gampola": "20500",
  "nawalapitiya": "20650",
  "gelioya": "20620",
  "kadugannawa": "20300",
  "kundasale": "20068",
  "pilimathalawa": "20450",
  "wattegama": "20810",

  // Matale
  "matale city": "21000",
  "dambulla": "21100",
  "sigiriya": "21120",

  // Nuwara Eliya
  "nuwara eliya city": "22200",
  "hatton": "22000",
  "talawakele": "22100",

  // Galle
  "galle city": "80000",
  "hikkaduwa": "80240",
  "karapitiya": "80000",
  "unawatuna": "80600",
  "ahangama": "80650",
  "habaraduwa": "80630",
  "ambalangoda": "80300",
  "bentota": "80500",
  "elpitiya": "80400",
  "baddegama": "80200",

  // Matara
  "matara city": "81000",
  "weligama": "81700",
  "mirissa": "81740",
  "dikwella": "81200",

  // Hambantota
  "hambantota city": "82000",
  "tangalle": "82200",
  "tissamaharama": "82600",

  // Jaffna
  "jaffna city": "40000",
  "chavakachcheri": "40520",
  "point pedro": "40500",

  // Vavuniya
  "vavuniya city": "43000",

  // Kurunegala
  "kurunegala city": "60000",
  "kuliyapitiya": "60200",

  // Puttalam
  "puttalam city": "61300",
  "chilaw": "61000",

  // Anuradhapura
  "anuradhapura city": "50000",

  // Polonnaruwa
  "polonnaruwa city": "51000",

  // Kegalle
  "kegalle city": "71000",
  "mawanella": "71500",

  // Ratnapura
  "ratnapura city": "70000",
  "embilipitiya": "70200",

  // Badulla
  "badulla city": "90000",
  "bandarawela": "90100",
  "ella": "90090",
  "diyatalawa": "90150",

  // Monaragala
  "monaragala city": "91000"
};

const getPostalCodeForCity = (cityName: string): string => {
  const normalized = cityName.trim().toLowerCase();
  return CITY_POSTAL_CODES[normalized] || "";
};

export default function CheckoutPage() {
  const { cart, clearSelectedItems, getCartTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyingAuth, setVerifyingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryData, setDeliveryData] = useState({ fee: 0, days: 0 });
  const [baseDeliveryDays, setBaseDeliveryDays] = useState<number>(0);

  const getFormattedDeliveryDate = (days: number) => {
    const date = new Date();
    if (days === 0) {
      return `Today (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMethodDays = (methodId: string) => {
    if (methodId === 'pickup') return 0;
    if (methodId === 'express') return Math.max(1, Math.ceil((baseDeliveryDays || 2) / 2));
    return baseDeliveryDays || 2;
  };

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

  // Per-field inline validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); 

  // ── Validation helpers ──────────────────────────────────────────────────────
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return 'Full name is required.';
    if (trimmed.length < 2) return 'Name must be at least 2 characters.';
    if (trimmed.length > 80) return 'Name must be at most 80 characters.';
    // Allow Unicode letters (Sinhala, Tamil, Arabic, Latin…), spaces, hyphens, apostrophes
    if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'\-\.]*[\p{L}\p{M}\.']?$/u.test(trimmed))
      return 'Name must contain only letters (any language), spaces, hyphens, or apostrophes.';
    return '';
  };

  const validatePhone = (value: string): string => {
    return validateSriLankanPhone(value);
  };

  const setFieldError = (field: string, msg: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: msg }));

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  // Validate on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      const msg = validateName(value);
      msg ? setFieldError('fullName', msg) : clearFieldError('fullName');
    }
    if (name === 'phone') {
      const msg = validatePhone(value);
      msg ? setFieldError('phone', msg) : clearFieldError('phone');
    }
  };

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
      return;
    }

    const verifyAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login?redirect=/checkout');
        return;
      }

      try {
        const res = await api.getMe(token);
        if (res.success && res.data) {
          const user = res.data;
          setIsAuthenticated(true);
          const storedUserStr = localStorage.getItem('user');
          let storedPhone = '';
          if (storedUserStr) {
            try {
              const parsed = JSON.parse(storedUserStr);
              storedPhone = parsed.phone || '';
            } catch (e) {}
          }
          setFormData(prev => ({
            ...prev,
            fullName: user.name || prev.fullName,
            email: user.email || prev.email,
            phone: user.phone || storedPhone || prev.phone || ''
          }));
        }
      } catch (err: any) {
        // Silently handle auth failure by clearing token and redirecting
        if (err.message.includes('authorized') || err.message.includes('token')) {
          localStorage.removeItem('auth_token');
          router.replace('/login?redirect=/checkout');
        }
      } finally {
        setVerifyingAuth(false);
      }
    };

    verifyAuth();
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
        if (res.success && res.data) {
          const data = res.data;
          setDeliveryData({ fee: data.fee, days: data.estimatedDays });
        }

        const baseRes = await api.calculateDeliveryFee({
          district: formData.district,
          deliveryMethod: 'standard'
        });
        if (baseRes.success && baseRes.data) {
          setBaseDeliveryDays(baseRes.data.estimatedDays);
        }
      } catch (err) {
        console.error('Fee calculation error:', err);
      }
    };
    calculateFee();
  }, [formData.district, formData.deliveryMethod]);

  // Find cities belonging to the selected district
  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    
    // Search in sri-lanka-locations data
    for (const province of provinces) {
      const match = province.districts.find(
        (d) => d.label.toLowerCase() === formData.district.toLowerCase() || 
               d.value.toLowerCase() === formData.district.toLowerCase()
      );
      if (match) {
        return match.cities;
      }
    }
    return [];
  }, [formData.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, city: '', postalCode: '' }));
    } else if (name === 'city') {
      const code = getPostalCodeForCity(value);
      setFormData(prev => ({ 
        ...prev, 
        city: value, 
        postalCode: code || prev.postalCode 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    // ── Frontend validation ────────────────────────────────────────────────
    const newErrors: Record<string, string> = {};

    const nameErr = validateName(formData.fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    if (!formData.district) newErrors.district = 'Please select a delivery district.';
    if (!formData.addressLine1) newErrors.addressLine1 = 'Address is required.';
    if (!formData.city) newErrors.city = 'City is required.';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required.';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fix the highlighted fields before continuing.');
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      const orderData = {
        orderItems: cart.filter(item => item.selected !== false).map(item => ({
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

      console.log('[Checkout] Placing order:', JSON.stringify(orderData, null, 2));

      const res = await api.createOrder(token, orderData);

      console.log('[Checkout] Order response:', res);

      if (res.success && res.data) {
        const order = res.data;
        if (formData.paymentMethod === 'payhere') {
          // Use the payment params from the backend — they contain the exact values
          // (amount, merchant_id, sandbox, hash) that were used to generate the hash.
          // Reconstructing these on the frontend causes mismatches and "Unauthorized" errors.
          const payment = {
            ...order.payhereParams,
            return_url: window.location.origin + `/orders/confirmation/${order._id}`,
            cancel_url: window.location.origin + `/checkout`,
          };

          const payhere = (window as any).payhere;
          if (payhere) {
            payhere.onCompleted = async function onCompleted(pOrderId: string) {
              clearSelectedItems();
              const targetOrderId = order._id || order.id || order.orderId;

              // Local development fallback: PayHere servers cannot reach localhost,
              // so we mock the webhook locally to ensure the DB updates.
              if (window.location.hostname === 'localhost') {
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/payhere-notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      merchant_id: payment.merchant_id,
                      order_id: targetOrderId,
                      payhere_amount: payment.amount,
                      payhere_currency: payment.currency,
                      status_code: '2',
                      md5sig: 'LOCAL_TEST'
                    })
                  });
                } catch (e) {
                  console.error('Local webhook mock failed', e);
                }
              }

              router.push(`/orders/confirmation/${targetOrderId}?payment=success`);
            };
            payhere.onDismissed = function onDismissed() {
              setLoading(false);
            };
            payhere.onError = function onError(error: any) {
              setError('Payment failed: ' + error);
              setLoading(false);
            };
            payhere.startPayment(payment);
          } else {
            setError('Payment gateway is not loaded. Please refresh and try again.');
            setLoading(false);
          }
        } else {
          // Default: Clear cart and go to confirmation
          clearSelectedItems();
          const targetOrderId = order._id || order.id || order.orderId;
          router.push(`/orders/confirmation/${targetOrderId}`);
        }
      } else {
        // Backend returned success:false — show the reason
        const errMsg = (res as any).message || 'Failed to place order. Please try again.';
        console.error('[Checkout] Order failed (success:false):', errMsg);
        setError(errMsg);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[Checkout] Order exception:', err);
      setError(err.message || 'Failed to place order. Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (verifyingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="lazyOnload"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand-light">
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
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Full Name</label>
                    {isAuthenticated && (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-brand" /> Account Locked
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-2xl border-1 transition-all duration-300 ${
                    isAuthenticated
                      ? 'bg-gray-100/80 border-gray-200 cursor-not-allowed'
                      : fieldErrors.fullName
                      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-50/50 bg-white shadow-sm'
                      : 'border-gray-100 focus-within:border-blue-500 focus-within:ring-blue-50/50 bg-white shadow-sm'
                  }`}>
                    <User className={`ml-4 w-4 h-4 flex-shrink-0 ${fieldErrors.fullName ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      required
                      readOnly={isAuthenticated}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 bg-transparent outline-none text-sm font-medium ${isAuthenticated ? 'text-gray-600 cursor-not-allowed' : 'text-gray-900'} placeholder:text-gray-400`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Email Address</label>
                    {isAuthenticated && (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-brand" /> Account Locked
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-2xl border-1 transition-all duration-300 ${
                    isAuthenticated
                      ? 'bg-gray-100/80 border-gray-200 cursor-not-allowed'
                      : 'border-gray-100 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 bg-white shadow-sm'
                  }`}>
                    <Mail className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      readOnly={isAuthenticated}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className={`w-full px-4 py-3 bg-transparent outline-none text-sm font-medium ${isAuthenticated ? 'text-gray-600 cursor-not-allowed' : 'text-gray-900'} placeholder:text-gray-400`}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Phone Number</label>
                    {isAuthenticated && formData.phone && (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-brand" /> Account Locked
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-2xl border-1 transition-all duration-300 ${
                    isAuthenticated && formData.phone
                      ? 'bg-gray-100/80 border-gray-200 cursor-not-allowed'
                      : fieldErrors.phone
                      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-50/50 bg-white shadow-sm'
                      : 'border-gray-100 focus-within:border-blue-500 focus-within:ring-blue-50/50 bg-white shadow-sm'
                  }`}>
                    <Phone className={`ml-4 w-4 h-4 flex-shrink-0 ${fieldErrors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      required
                      readOnly={isAuthenticated && !!formData.phone}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="07XXXXXXXX (e.g. 0771234567)"
                      className={`w-full px-4 py-3 bg-transparent outline-none text-sm font-medium ${isAuthenticated && formData.phone ? 'text-gray-600 cursor-not-allowed' : 'text-gray-900'} placeholder:text-gray-400`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Shipping Address */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Address Line 1</label>
                  <div className="flex items-center rounded-2xl border-1 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300">
                    <Building2 className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      required
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="Street name, building number..."
                      className="w-full px-4 py-3 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Address Line 2 (Optional)</label>
                  <div className="flex items-center rounded-2xl border-1 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300">
                    <Building2 className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-4 py-3 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">District</label>
                  <div className="flex items-center rounded-2xl border-1 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300 relative">
                    <LocateFixed className="ml-4 w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      required
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-transparent outline-none text-sm font-medium appearance-none cursor-pointer ${!formData.district ? "text-gray-400" : "text-gray-900"
                        }`}
                    >
                      <option value="" disabled>Select District</option>
                      {ALL_DISTRICTS.map(d => (
                        <option key={d.value} value={d.value} className="text-gray-900">{d.label}</option>
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
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">City</label>
                  {availableCities.length > 0 ? (
                    <div className="flex items-center rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300 relative">
                      <select
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 bg-transparent outline-none text-sm font-medium appearance-none cursor-pointer ${!formData.city ? "text-gray-400" : "text-gray-900"
                          }`}
                      >
                        <option value="" disabled>Select City</option>
                        {availableCities.map(c => (
                          <option key={c.value} value={c.label} className="text-gray-900">
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {/* Custom Arrow */}
                      <div className="absolute right-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300">
                      <input
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder={formData.district ? "Enter City" : "Select District first"}
                        disabled={!formData.district}
                        className="w-full px-5 py-4 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider ml-1">Postal Code</label>
                  <div className="flex items-center rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300">
                    <input
                      required
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="E.g. 10000"
                      className="w-full px-5 py-3 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
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
                  <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Method</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'standard', label: 'Standard Delivery', desc: 'Normal transit time' },
                    { id: 'express', label: 'Express Delivery', desc: 'Faster delivery (+50% fee)' },
                    { id: 'pickup', label: 'Store Pickup', desc: 'Pick up at store (FREE)' }
                  ].map((m) => {
                    const mDays = getMethodDays(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.deliveryMethod === m.id
                            ? 'border-brand bg-brand-light/50'
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
                            className="w-4 h-4 text-brand focus:ring-brand-light0"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{m.label}</p>
                            <p className="text-[10px] text-gray-500">{m.desc}</p>
                            {formData.district && (
                              <p className="text-[11px] font-semibold text-brand mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Est. Delivery: {getFormattedDeliveryDate(mDays)}
                              </p>
                            )}
                          </div>
                        </div>
                        {formData.deliveryMethod === m.id && <CheckCircle2 className="w-5 h-5 text-brand" />}
                      </label>
                    );
                  })}
                </div>

                {formData.district ? (
                  <div className="mt-4 p-3.5 rounded-2xl bg-brand-light/70 border border-brand/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0 font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Estimated Delivery Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {getFormattedDeliveryDate(deliveryData.days)}
                        <span className="text-xs font-semibold text-brand ml-2">
                          ({deliveryData.days === 0 ? 'Ready for Pickup' : `${deliveryData.days} ${deliveryData.days === 1 ? 'day' : 'days'} transit`})
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-gray-50 text-gray-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    Select a district to view estimated delivery date
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'cash-on-delivery', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                    { id: 'payhere', label: 'PayHere', desc: 'Secure online payment', logo: 'https://www.payhere.lk/downloads/images/payhere_short_banner.png' }
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === p.id
                          ? 'border-brand bg-brand-light/50'
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
                          className="w-4 h-4 text-brand focus:ring-brand-light0"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{p.label}</p>
                          <p className="text-[10px] text-gray-500">{p.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.logo && (
                          <div className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                            <img src={p.logo} alt={p.label} className="h-5 object-contain" />
                          </div>
                        )}
                        {formData.paymentMethod === p.id && <CheckCircle2 className="w-5 h-5 text-brand" />}
                      </div>
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
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 text-gray-900 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit space-y-8">
            <OrderSummary
              items={cart.filter(item => item.selected !== false)}
              deliveryFee={deliveryData.fee}
              estimatedDays={formData.district ? deliveryData.days : undefined}
              subtotal={subtotal}
            />

            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 p-5 rounded-2xl flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide mb-1">Order Failed</p>
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-dark text-white shadow-brand-light active:scale-95'
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

