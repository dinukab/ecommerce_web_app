'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CategorySidebar from '@/components/category/CategorySidebar';
import ProductCard from '@/components/category/ProductCard';
import { fetchCategories, fetchCategoryBySlug, type Category } from '@/api/Categoryapi';
import { fetchProducts, type Product } from '@/api/Productapi';

export const dynamic = 'force-dynamic';

interface SortOption {
  value: string;
  label: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'name',        label: 'Name (A–Z)' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'rating',     label: 'Top Rated' },
];

const SKELETONS = Array.from({ length: 8 });

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const searchParams = useSearchParams();

  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products, setProducts]             = useState<Product[]>([]);
  const [pagination, setPagination]         = useState<Partial<PaginationData>>({});
  const [loading, setLoading]               = useState<boolean>(true);
  const [error, setError]                   = useState<string | null>(null);

  const sort   = searchParams?.get('sort')   || 'name';
  const search = searchParams?.get('search') || '';
  const page   = Number(searchParams?.get('page') || 1);

  // Fetch sidebar categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Fetch active category meta (for heading)
  useEffect(() => {
    if (!slug || slug === 'all') {
      setActiveCategory(null);
      return;
    }
    fetchCategoryBySlug(slug as string)
      .then(setActiveCategory)
      .catch(() => setActiveCategory(null));
  }, [slug]);

  // Fetch products whenever slug / sort / search / page changes
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({
        category: slug === 'all' ? '' : (slug as string),
        sort,
        search,
        page,
        limit: 20,
      });
      setProducts(result.data || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [slug, sort, search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const router = useRouter();

  const updateParam = (key: string, value: string | number) => {
    const next = new URLSearchParams(searchParams?.toString() || '');
    next.set(key, String(value));
    if (key !== 'page') next.set('page', '1');
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link href="/category/all" className="hover:text-indigo-600">Categories</Link>
          {slug && slug !== 'all' && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {activeCategory?.name || slug}
              </span>
            </>
          )}
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <CategorySidebar categories={categories} activeSlug={slug} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {activeCategory?.name || 'All Products'}
              </h1>
              {activeCategory?.description && (
                <p className="text-gray-600">{activeCategory.description}</p>
              )}
            </div>


            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-600">
                <p className="font-semibold">Error loading products</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading
                ? SKELETONS.map((_, i) => <ProductSkeleton key={i} />)
                : products.length > 0
                ? products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))
                : (
                    <div className="col-span-full text-center py-16">
                      <p className="text-gray-500 text-lg mb-4">No products found</p>
                      <Link
                        href="/category/all"
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Browse all categories
                      </Link>
                    </div>
                  )}
            </div>

            {/* Pagination */}
            {pagination.total && pagination.total > 20 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {page > 1 && (
                  <button
                    onClick={() => updateParam('page', page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {Math.ceil((pagination.total || 0) / 20)}
                </span>
                {page < Math.ceil((pagination.total || 0) / 20) && (
                  <button
                    onClick={() => updateParam('page', page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
