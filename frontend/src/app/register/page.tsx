'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // Use the API service instead of manual fetch
      await api.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);
      // Optional: Clear form on success
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        router.push(redirect ? `/login?redirect=${redirect}` : '/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#151194] rounded flex items-center justify-center ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">OneShop</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-2">Create Account</h1>
            <p className="text-gray-500 text-sm">Join with Oneshop today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              Successfully registered! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 ml-1">Full Name</label>
              <Input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black focus:ring-[#1a1b4b] focus:border-[#1a1b4b]]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 ml-1">Email Address</label>
              <Input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black
                 focus:ring-[#1a1b4b] focus:border-[#1a1b4b]]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black focus:ring-[#1a1b4b] focus:border-[#1a1b4b]]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 ml-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black focus:ring-[#1a1b4b] focus:border-[#1a1b4b]]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 "
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500 mb-4">
                I agree to the Terms of Service and Privacy Policy
              </p>
              
              <Button 
                type="submit" 
                variant="default" 
                className="w-full bg-[#151194] hover:bg-[#252661] text-white py-6 rounded-xl text-lg flex items-center justify-center gap-2"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/login${window.location.search}`);
                }}
                className="text-[#151194] hover:text-[#2a2b5b] font-bold"
              >
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  
  );
}
