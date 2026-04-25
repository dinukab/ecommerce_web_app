'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      // Handle successful login
      setSuccess(true);
      
      // Store token (this would ideally be handled in an AuthContext)
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
              <div className="w-8 h-8 bg-[#151194] rounded-xl flex items-center justify-center ">
                {/* Shopping bag icon approximation */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">OneShop</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-2">Welcome</h1>
            <p className="text-gray-500 text-sm">Sign in to continue shopping</p>
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
              Login successful! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs  font-medium text-gray-700 ml-1">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com "
                className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black focus:ring-[#1a1b4b] focus:border-[#1a1b4b]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-xl border-[#d1d5db] bg-[#f9fafb] shadow-sm text-black focus:ring-[#1a1b4b] focus:border-[#1a1b4b]"
                  required
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

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#1a1b4b] border-[#d1d5db] rounded focus:ring-[#1a1b4b]"
                />
                <span className="ml-2 text-xs text-gray-500">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#151194] hover:text-[#2a2b5b] font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              variant="default" 
              className="w-full bg-[#151194] hover:bg-[#252661] text-white py-6 rounded-xl text-lg flex items-center justify-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>


          <div className="mt-8 text-center text-sm">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[#151194] hover:text-[#2a2b5b] font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
