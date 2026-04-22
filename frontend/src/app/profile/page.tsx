'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, CreditCard, Settings, ChevronRight, Edit2, Camera, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Shipping' | 'Processing' | 'Cancelled';
  items: number;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  // Address management states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    type: 'Home',
    name: '',
    address: '',
    phone: '',
    isDefault: false
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment management states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    type: 'Visa',
    cardNumber: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Settings management states
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
      setUserEmail(user.email);
      
      // Fetch full user data including avatar
      fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setSettingsFormData(prev => ({
        ...prev,
        name: userData.name || '',
        phone: userData.phone || ''
      }));
    }
  }, [userData]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await api.getMe(token);
      if (response.success && response.data) {
        setUserData(response.data);
        setUserAvatar(response.data.avatar || '');
        setUserName(response.data.name || '');
        setUserEmail(response.data.email || '');
      }

      const ordersRes = await api.getOrders(token);
      if (ordersRes) {
        setOrders(ordersRes);
      }

      const wishlistRes = await api.getWishlist(token);
      if (wishlistRes.success && wishlistRes.data) {
        const wishlistItems = Array.isArray(wishlistRes.data.products) 
          ? wishlistRes.data.products.length 
          : (wishlistRes.data.length || 0);
        setWishlistCount(wishlistItems);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          showToast('Please login again', 'error');
          return;
        }

        try {
          const response = await api.updateAvatar(token, base64String);
          
          if (response.success) {
            setUserAvatar(base64String);
            setShowPhotoUpload(false);
            showToast('Profile photo updated successfully!', 'success');
            
            // Update user data in localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              user.avatar = base64String;
              localStorage.setItem('user', JSON.stringify(user));
            }
          }
        } catch (error: any) {
          showToast(error.message || 'Failed to upload photo', 'error');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      showToast('Error processing image', 'error');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const userInfo = {
    name: userData?.name || userName || 'User',
    email: userData?.email || userEmail || 'user@example.com',
    phone: userData?.phone || 'Not provided',
    avatar: getInitials(userData?.name || userName || 'User'),
    memberSince: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...',
  };

  // Address management handlers
  const handleAddAddressClick = () => {
    setEditingAddressId(null);
    setAddressFormData({
      type: 'Home',
      name: '',
      address: '',
      phone: '',
      isDefault: false
    });
    setAddressError('');
    setShowAddressForm(true);
  };

  const handleEditAddressClick = (addressId: string) => {
    const address = userData?.addresses?.find((a: any) => a._id === addressId);
    if (address) {
      setEditingAddressId(addressId);
      setAddressFormData({
        type: address.type,
        name: address.name,
        address: address.address,
        phone: address.phone,
        isDefault: address.isDefault || false
      });
      setAddressError('');
      setShowAddressForm(true);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAddressError('Please login again');
      return;
    }

    try {
      setAddressLoading(true);
      const response = await api.removeAddress(token, addressId);
      
      if (response.success) {
        // Refresh user data
        await fetchUserProfile();
        showToast('Address deleted successfully!', 'success');
      } else {
        setAddressError(response.message || 'Failed to delete address');
      }
    } catch (error: any) {
      setAddressError(error.message || 'Error deleting address');
    } finally {
      setAddressLoading(false);
    }
  };

  const validateAddressForm = () => {
    if (!addressFormData.name.trim()) {
      setAddressError('Address label is required');
      return false;
    }
    if (!addressFormData.address.trim()) {
      setAddressError('Address is required');
      return false;
    }
    if (!addressFormData.phone.trim()) {
      setAddressError('Phone number is required');
      return false;
    }
    if (addressFormData.phone.trim().length < 10) {
      setAddressError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!validateAddressForm()) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAddressError('Please login again');
      return;
    }

    try {
      setAddressLoading(true);

      let response;
      if (editingAddressId) {
        // Update address
        response = await api.updateAddress(token, editingAddressId, addressFormData);
      } else {
        // Add new address
        response = await api.addAddress(token, addressFormData);
      }

      if (response.success) {
        // Refresh user data
        await fetchUserProfile();
        setShowAddressForm(false);
        showToast(editingAddressId ? 'Address updated successfully!' : 'Address added successfully!', 'success');
      } else {
        setAddressError(response.message || 'Failed to save address');
      }
    } catch (error: any) {
      setAddressError(error.message || 'Error saving address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddPaymentClick = () => {
    setPaymentFormData({
      type: 'Visa',
      cardNumber: '',
      expiry: '',
      cvv: '',
      isDefault: false
    });
    setPaymentError('');
    setShowPaymentForm(true);
  };

  const handleDeletePayment = async (cardId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setPaymentError('Please login again');
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await api.removePaymentMethod(token, cardId);
      if (response.success) {
        await fetchUserProfile();
        showToast('Payment method deleted successfully!', 'success');
      } else {
        setPaymentError(response.message || 'Failed to delete payment method');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Error deleting payment method');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!paymentFormData.cardNumber || !paymentFormData.expiry || !paymentFormData.cvv) {
      setPaymentError('Please fill in all payment details');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setPaymentError('Please login again');
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await api.addPaymentMethod(token, paymentFormData);
      if (response.success) {
        await fetchUserProfile();
        setShowPaymentForm(false);
        showToast('Payment method added successfully!', 'success');
      } else {
        setPaymentError(response.message || 'Failed to add payment method');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Error adding payment method');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setSettingsError('Please login again');
      return;
    }

    // Validate form
    if (!settingsFormData.name.trim()) {
      setSettingsError('Full name is required');
      return;
    }

    try {
      setSettingsLoading(true);

      // Update profile information
      const profileUpdate = await api.updateProfile(token, {
        name: settingsFormData.name,
        phone: settingsFormData.phone
      });

      if (!profileUpdate.success) {
        setSettingsError(profileUpdate.message || 'Failed to update profile');
        return;
      }

      // If changing password, validate and update
      if (settingsFormData.newPassword) {
        if (settingsFormData.newPassword !== settingsFormData.confirmPassword) {
          setSettingsError('New passwords do not match');
          return;
        }

        if (settingsFormData.newPassword.length < 6) {
          setSettingsError('Password must be at least 6 characters');
          return;
        }

        if (!settingsFormData.currentPassword) {
          setSettingsError('Current password is required to change password');
          return;
        }

        const passwordUpdate = await api.changePassword(token, {
          currentPassword: settingsFormData.currentPassword,
          newPassword: settingsFormData.newPassword
        });

        if (!passwordUpdate.success) {
          setSettingsError(passwordUpdate.message || 'Failed to change password');
          return;
        }
      }

      // Update local state
      setUserName(settingsFormData.name);
      setSettingsFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh user data
      await fetchUserProfile();
      showToast('Settings updated successfully!', 'success');
    } catch (error: any) {
      setSettingsError(error.message || 'Error saving settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const recentOrders = (orders || []).map(o => ({
    id: o.orderId || o._id,
    date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    total: o.total,
    status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
    items: o.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0,
  }));

  const addresses = (userData?.addresses || []).map((a: any) => ({
    ...a,
    id: a._id
  }));

  const savedCards = (userData?.paymentMethods || []).map((p: any) => ({
    ...p,
    id: p._id
  }));

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info with Photo Upload */}
              <div className="text-center mb-6 pb-6 border-b relative">
                {/* Profile Photo */}
                <div className="relative inline-block">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userInfo.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                      {userInfo.avatar}
                    </div>
                  )}
                  
                  {/* Camera Icon Button */}
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="absolute bottom-2 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                    title="Change profile photo"
                  >
                    <Camera className="h-4 w-4 text-blue-600" />
                  </button>
                </div>

                <h3 className="font-bold text-gray-900">{userInfo.name}</h3>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
                <p className="text-xs text-gray-500 mt-2">Member since {userInfo.memberSince}</p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Addresses</span>
                </button>

                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payment'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Payment Methods</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{userData?.totalOrders || 0}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Wishlist Items</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{wishlistCount}</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg">
                        <Heart className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">Rs {(userData?.totalSpent || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{order.id}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{order.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{order.items} items</span>
                          <span className="font-bold text-gray-900">Rs {order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{order.id}</h3>
                          <p className="text-sm text-gray-600">Placed on {order.date}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-sm text-gray-600">{order.items} items • </span>
                          <span className="font-bold text-gray-900">Rs {order.total}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddAddressClick}>Add New Address</Button>
                </div>

                {addresses.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No addresses saved yet. Add one to get started!</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900">{address.type}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditAddressClick(address.id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Edit address"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={addressLoading}
                              className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                              title="Delete address"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-900 font-medium mb-1">{address.name}</p>
                        <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <p className="text-gray-500 text-sm mb-6">
                        {editingAddressId ? 'Update your address details' : 'Add a new delivery address'}
                      </p>

                      {addressError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{addressError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAddressFormSubmit} className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address Type
                          </label>
                          <select
                            value={addressFormData.type}
                            onChange={(e) => setAddressFormData({ ...addressFormData, type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <option value="Home">🏠 Home</option>
                            <option value="Office">🏢 Office</option>
                            <option value="Other">📍 Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Label (e.g., My Home)
                          </label>
                          <input
                            type="text"
                            value={addressFormData.name}
                            onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                            placeholder="Enter address label"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Address
                          </label>
                          <textarea
                            value={addressFormData.address}
                            onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                            placeholder="Enter your full address including street, city, and postal code"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                            placeholder="Enter phone number"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                          />
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressFormData.isDefault}
                            onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            disabled={addressLoading}
                            className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addressLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            {addressLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              editingAddressId ? '✓ Update Address' : '+ Add Address'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddPaymentClick}>Add New Card</Button>
                </div>

                <div className="space-y-4">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-bold text-gray-900">{card.type}</p>
                              {card.isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              •••• •••• •••• {card.last4}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">Expires {card.expiry}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeletePayment(card.id)} className="text-red-600 hover:text-red-700 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Form Modal */}
                {showPaymentForm && (
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        Add New Card
                      </h3>
                      <p className="text-gray-500 text-sm mb-6">
                        Add a new payment method
                      </p>

                      {paymentError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{paymentError}</span>
                        </div>
                      )}

                      <form onSubmit={handlePaymentFormSubmit} className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Card Type
                          </label>
                          <select
                            value={paymentFormData.type}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Amex">American Express</option>
                            <option value="Discover">Discover</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={paymentFormData.cardNumber}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, cardNumber: e.target.value })}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={paymentFormData.expiry}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, expiry: e.target.value })}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="password"
                              value={paymentFormData.cvv}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, cvv: e.target.value })}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <input
                            type="checkbox"
                            id="isDefaultPayment"
                            checked={paymentFormData.isDefault}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, isDefault: e.target.checked })}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor="isDefaultPayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Set as default payment method
                          </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            disabled={paymentLoading}
                            className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={paymentLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            {paymentLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              '+ Add Card'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

                {settingsError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{settingsError}</span>
                  </div>
                )}

                <form onSubmit={handleSettingsSave} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={settingsFormData.name}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userInfo.email}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={settingsFormData.phone}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="pt-6 border-t">
                    <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
                    <p className="text-sm text-gray-600 mb-4">Leave blank to keep your current password</p>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={settingsFormData.currentPassword}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={settingsFormData.newPassword}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={settingsFormData.confirmPassword}
                          onChange={(e) => setSettingsFormData({ ...settingsFormData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t">
                    <button
                      type="submit"
                      disabled={settingsLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                    >
                      {settingsLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoUpload(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Profile Photo</h2>

            <div className="mb-6">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}