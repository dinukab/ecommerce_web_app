'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Heart, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { storeConfig } from '@/lib/storeConfig';
import { useStore } from '@/context/StoreContext';

export default function Navbar() {
  const { settings, loading } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { getCartCount } = useCart();

  const pathname = usePathname();
  const isCheckoutFlowPage = pathname?.startsWith('/cart/checkout') ?? false;
  const cartCount = getCartCount();

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        const response = await api.getProducts({
          search: searchQuery.trim(),
          limit: 8,
        });

        if (response.data && Array.isArray(response.data)) {
          setSuggestions(response.data.slice(0, 8));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center justify-between h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            {!logoError ? (
              <img
                src={settings?.logoUrl || storeConfig.logoUrl}
                alt={settings?.storeName || storeConfig.storeName}
                className="h-9 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              /* Fallback letter badge if logo fails to load */
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: settings?.primaryColor || storeConfig.primaryColor }}
              >
                <span className="text-white font-bold text-lg">
                  {(settings?.storeName || storeConfig.storeName)[0]}
                </span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
              {settings?.storeName || storeConfig.storeName}
            </span>
          </Link>

          {/* Search Bar */}
          {!isCheckoutFlowPage && (
            <div className="flex md:flex flex-1 max-w-2xl xl:max-w-3xl mx-4 lg:mx-10 xl:mx-16">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-300 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': storeConfig.primaryColor } as any}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                >
                  <Search className="w-4.5 h-4.5 text-gray-600 font-bold" />
                </button>

                {/* Suggestions Dropdown */}
                {showSuggestions && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <div
                          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin inline-block"
                          style={{ borderColor: storeConfig.primaryColor, borderTopColor: 'transparent' }}
                        />
                        <p className="mt-2">Searching...</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {suggestions.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleSuggestionClick(product._id)}
                            className="w-full px-4 py-3 hover:bg-brand-light transition-colors text-left flex items-center gap-3"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img
                                src={product.images?.[0] || 'https://placehold.co/48x48/e8eaff/6366f1?text=Product'}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                              <p className="font-semibold text-sm" style={{ color: storeConfig.primaryColor }}>
                                {storeConfig.currency} {product.sellingPrice?.toLocaleString() || product.price?.toLocaleString()}
                              </p>
                            </div>
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No products found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Right Nav Icons */}
          <div className="flex md:flex items-center space-x-10">
            {!isCheckoutFlowPage && (
              <Link
                href="/wishlist"
                className="flex items-center space-x-1 text-gray-600 transition-colors whitespace-nowrap"
                style={{ ['--hover-color' as any]: storeConfig.primaryColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = storeConfig.primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-bold text-sm">Wishlist</span>
              </Link>
            )}

            {!isCheckoutFlowPage && (
              <Link
                href="/cart"
                className="flex items-center space-x-1 text-gray-600 transition-colors whitespace-nowrap"
                onMouseEnter={(e) => (e.currentTarget.style.color = storeConfig.primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                <div className="relative">
                  <ShoppingCart
                    className="w-5.5 h-5.5 fill-current"
                    style={{ color: storeConfig.primaryColor }}
                  />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white box-content"
                      style={{ backgroundColor: storeConfig.primaryColor }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm ml-1">Cart</span>
              </Link>
            )}

            <Link
              href="/orders"
              className="flex items-center space-x-1 text-gray-600 transition-colors whitespace-nowrap"
              onMouseEnter={(e) => (e.currentTarget.style.color = storeConfig.primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <ShoppingBag className="w-5 h-5 fill-current" />
              <span className="font-bold text-sm">Orders</span>
            </Link>

            <Link
              href="/track"
              className="flex items-center space-x-1 text-gray-600 transition-colors whitespace-nowrap"
              onMouseEnter={(e) => (e.currentTarget.style.color = storeConfig.primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <Truck className="w-5 h-5" />
              <span className="font-bold text-sm">Track</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center space-x-1 text-gray-600 transition-colors whitespace-nowrap"
              onMouseEnter={(e) => (e.currentTarget.style.color = storeConfig.primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <User className="w-5 h-5 fill-current" />
              <span className="font-bold text-sm">Account</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
