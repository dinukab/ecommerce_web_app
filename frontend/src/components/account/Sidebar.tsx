'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { User, Camera, ShoppingBag, Truck, Heart, RefreshCcw, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { api } from '@/lib/api';

export default function AccountSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams ? searchParams.get('filter') : null;

  const [userAvatar, setUserAvatar] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Toast notifications for the sidebar
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

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
    } catch (error: any) {
      if (error?.message?.includes('authorized') || error?.message?.includes('token')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
      setUserEmail(user.email);
      fetchUserProfile();
    }

    // Listen for custom event to trigger refresh when profile is updated in other components
    const handleUserUpdate = () => {
      fetchUserProfile();
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    setUploading(true);

    try {
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
            
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              user.avatar = base64String;
              localStorage.setItem('user', JSON.stringify(user));
            }
            // Notify other components
            window.dispatchEvent(new Event('user-updated'));
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
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const userInfo = {
    name: userData?.name || userName || 'User',
    email: userData?.email || userEmail || 'user@example.com',
    avatar: getInitials(userData?.name || userName || 'User'),
    memberSince: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...',
  };

  const isActive = (path: string, currentFilter?: string | null) => {
    if (!pathname) return false;
    if (currentFilter) {
      return pathname === path && filter === currentFilter;
    }
    if (path === '/orders' && filter) return false;
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Toasts overlay for the sidebar */}
      <div className="absolute top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-2 rounded shadow text-white text-sm ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* User Info with Photo Upload */}
      <div className="text-center mb-6 pb-6 border-b relative">
        <div className="relative inline-block">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userInfo.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {userInfo.avatar}
            </div>
          )}
          
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="absolute bottom-2 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            title="Change profile photo"
          >
            <Camera className="h-4 w-4 text-brand" />
          </button>
        </div>

        {showPhotoUpload && (
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col items-center justify-center z-10">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="avatar-upload-sidebar"
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload-sidebar"
              className="bg-brand text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-brand-dark transition-colors text-sm mb-2"
            >
              {uploading ? 'Uploading...' : 'Choose Photo'}
            </label>
            <button
              onClick={() => setShowPhotoUpload(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        )}

        <h3 className="font-bold text-gray-900">{userInfo.name}</h3>
        <p className="text-sm text-gray-800">{userInfo.email}</p>
        <p className="text-xs text-gray-800 mt-2">Member since {userInfo.memberSince}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        <Link
          href="/profile?tab=settings"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            searchParams?.get('tab') === 'settings' || (pathname === '/profile' && !searchParams?.get('tab'))
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="font-medium text-sm">Manage My Account</span>
        </Link>

        <Link
          href="/orders"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/orders')
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-medium text-sm">My Orders</span>
        </Link>

        <Link
          href="/track"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/track')
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Truck className="h-5 w-5" />
          <span className="font-medium text-sm">Track</span>
        </Link>

        <Link
          href="/wishlist"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/wishlist')
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="font-medium text-sm">Wishlist</span>
        </Link>

        <Link
          href="/orders?filter=cancelled"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/orders', 'cancelled')
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <RefreshCcw className="h-5 w-5" />
          <span className="font-medium text-sm">My Returns & Cancellations</span>
        </Link>

        <Link
          href="/profile?tab=overview"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            searchParams?.get('tab') === 'overview'
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium text-sm">Overview</span>
        </Link>

        <Link
          href="/contact"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/contact')
              ? 'bg-brand-light text-brand'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium text-sm">Message Centre</span>
        </Link>


      </nav>
    </div>
  );
}
