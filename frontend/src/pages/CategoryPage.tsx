import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CategorySidebar from '../components/category/CategorySidebar';
import ProductCard from '../components/category/ProductCard';
import { fetchCategories, fetchCategoryBySlug, type Category } from '../api/Categoryapi';
import { fetchProducts, type Product, type Pagination } from '../api/Productapi';

interface SortOption {
  value: string;
  label: string;
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
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products, setProducts]             = useState<Product[]>([]);
  const [pagination, setPagination]         = useState<Partial<Pagination>>({});
  const [loading, setLoading]               = useState<boolean>(true);
  const [error, setError]                   = useState<string | null>(null);

  const sort   = searchParams.get('sort')   || 'name';
  const search = searchParams.get('search') || '';
  const page   = Number(searchParams.get('page') || 1);

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
    fetchCategoryBySlug(slug)
      .then(setActiveCategory)
      .catch(() => setActiveCategory(null));
  }, [slug]);

  // Fetch products whenever slug / sort / search / page changes
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({
        category: slug === 'all' ? '' : slug,
        sort,
        search,
        page,
        limit: 20,
      });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [slug, sort, search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParam = (key: string, value: string | number) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, String(value));
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const heading =
    slug === 'all'
      ? 'All Products'
      : activeCategory?.name ??
        slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ??
        'Products';

  const totalPages = pagination.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ── */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-700 text-lg shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              O
            </span>
            OneShop
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="ml-auto flex items-center gap-5 text-sm text-gray-600">
            <Link to="/wishlist" className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </Link>
            <Link to="/cart" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
            </Link>
            <Link to="/account" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>›</span>
          <Link to="/category/all" className="hover:text-indigo-600">Products</Link>
          {slug && slug !== 'all' && (
            <>
              <span>›</span>
              <span className="text-gray-800 font-medium">{heading}</span>
            </>
          )}
        </nav>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-screen-xl mx-auto px-4 pb-12 flex gap-6">
        <CategorySidebar categories={categories} activeSlug={slug} />

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {activeCategory?.icon && (
                  <span className="text-2xl">{activeCategory.icon}</span>
                )}
                {heading}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {pagination.total ?? 0} product{pagination.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-gray-500 font-medium">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-4">
              {error} —{' '}
              <button onClick={loadProducts} className="underline font-medium">
                Retry
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? SKELETONS.map((_, i) => <ProductSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-4xl">
                {activeCategory?.icon || '📭'}
              </div>
              <h3 className="text-lg font-semibold text-gray-700">No products yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {search
                  ? `No products match "${search}" in this category.`
                  : 'Products in this category will appear here once added.'}
              </p>
              {search && (
                <button
                  onClick={() => updateParam('search', '')}
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', page - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => updateParam('page', item as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        item === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                disabled={page >= totalPages}
                onClick={() => updateParam('page', page + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}