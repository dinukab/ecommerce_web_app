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

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button type="button" className="relative w-full flex items-center justify-center px-4 py-3 border border-[#d1d5db] rounded-xl hover:bg-[#f9fafb] transition-colors">
              <div className="absolute left-4">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-２．0９V７．０７H２．１８C１．４３ ８．５５ １ １０．２２ １ １２s．４３ ３．４５ １．１８ ４．９３l２．８５-２．２２．８１-.６２z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span className="text-gray-900 font-bold text-base">google</span>
            </button>

            <button type="button" className="relative w-full flex items-center justify-center px-4 py-3 border border-[#d1d5db] rounded-xl hover:bg-[#f9fafb] transition-colors">
              <div className="absolute left-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-gray-900 font-bold text-base">facebook</span>
            </button>

            <button type="button" className="relative w-full flex items-center justify-center px-4 py-3 border border-[#d1d5db] rounded-xl hover:bg-[#f9fafb] transition-colors">
              <div className="absolute left-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.496 3.603-2.998 1.156-1.666 1.635-3.282 1.661-3.366-.035-.015-3.149-1.206-3.184-4.815-.027-3.02 2.457-4.475 2.571-4.545-1.41-2.062-3.606-2.34-4.385-2.378-2-.132-4.004 1.04-4.55 1.04zm-.556-1.503c.833-1.01 1.393-2.41 1.24-3.811-1.192.048-2.658.795-3.518 1.803-.767.88-1.442 2.308-1.266 3.687 1.332.104 2.711-.669 3.544-1.679z"/>
                </svg>
              </div>
              <span className="text-gray-900 font-bold text-base">apple</span>
            </button>
          </div>

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
