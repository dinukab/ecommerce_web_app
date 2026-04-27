'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/category/ProductCard';
import { ArrowRight, Tag, Sparkles, Clock } from 'lucide-react';
import CategoriesDropdown from '@/components/CategoriesDropdown';
import { fetchProducts, type Product } from '@/api/Productapi';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const dynamic = 'force-dynamic';

const heroSlides = [
  {
    id: 1,
    badge: 'Limited Time Offer',
    title: 'Flash Sale',
    subtitle: 'Up to 50% off on selected items',
    description: 'Discover amazing deals on top products. Shop before the sale ends and save big on your favorite items.',
    gradient: 'from-blue-900 via-blue-600 to-indigo-700',
    subtitleColor: 'text-blue-100',
    descriptionColor: 'text-blue-200',
  },
  {
    id: 2,
    badge: 'New Arrivals',
    title: 'Fresh Styles',
    subtitle: 'Trending picks for this season',
    description: 'Explore our latest collection curated for comfort, style, and everyday confidence.',
    gradient: 'from-cyan-900 via-sky-600 to-blue-700',
    subtitleColor: 'text-cyan-100',
    descriptionColor: 'text-cyan-200',
  },
  {
    id: 3,
    badge: 'Members Exclusive',
    title: 'Weekend Deals',
    subtitle: 'Special prices for premium products',
    description: 'Unlock member-only discounts and enjoy fast shipping on selected items this weekend.',
    gradient: 'from-slate-900 via-slate-700 to-zinc-800',
    subtitleColor: 'text-slate-100',
    descriptionColor: 'text-slate-300',
  },
];

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [trendingRes, newRes, allRes] = await Promise.all([
          fetchProducts({ limit: 12, sort: 'rating' }),
          fetchProducts({ limit: 12, sort: 'newest' }),
          fetchProducts({ limit: 40, sort: 'name' })
        ]);
        setTrending(trendingRes.data || []);
        setNewArrivals(newRes.data || []);
        setAllProducts(allRes.data || []);
      } catch (err) {
        console.error('Error fetching home products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-900 text-white px-5 py-3 rounded-lg shadow-lg text-xs font-medium ">
          ✓ {notification}
        </div>
      )}

      {/* ── Hero Carousel Section ── */}
      <section className="relative overflow-visible">
        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="ml-0 ">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0">
                <div className={`bg-linear-to-r ${slide.gradient} text-white`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-semibold tracking-wide">{slide.badge}</span>
                      </div>

                      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
                        {slide.title}
                      </h1>

                      <p className={`text-xl md:text-2xl mb-3 font-medium ${slide.subtitleColor}`}>
                        {slide.subtitle}
                      </p>
                      <p className={`text-base mb-10 max-w-lg ${slide.descriptionColor}`}>
                        {slide.description}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <Link
                          href="/category/all"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#151194] font-bold hover:bg-blue-50 transition-colors"
                        >
                          Shop Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/register"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-bold hover:bg-white/20 transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden md:block">
            <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </div>
        </Carousel>
      </section>

      {/* Categories Dropdown - Placed near Hero Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900">Browse by Category</h3>
            <p className="text-sm text-gray-500">Find exactly what you need</p>
          </div>
          <CategoriesDropdown />
        </div>
      </section>

      {/* ── Trending Now Section ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-gray-500 mt-1">Our most popular grocery picks</p>
              </div>
            </div>
            <Link href="/category/all" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse"></div>
              ))
            ) : trending.length > 0 ? (
              trending.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-10">No trending products found.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── New Arrivals Section ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-gray-500 mt-1">Fresh items added recently</p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse"></div>
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-10">No new arrivals found.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Explore Our Collection Section ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Explore Our Collection</h2>
                <p className="text-gray-500 mt-1">Our full range of fresh products</p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse"></div>
              ))
            ) : allProducts.length > 0 ? (
              allProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-10">No products found.</p>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all hover:scale-105"
            >
              View Entire Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-[#151194] to-indigo-600 rounded-[2.5rem] p-12 text-center text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Can't find what you're looking for?</h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                Explore our full catalog of over 250+ fresh grocery products across all categories.
              </p>
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#151194] font-bold rounded-2xl hover:bg-blue-50 transition-all hover:scale-105"
              >
                Explore Full Catalog
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}