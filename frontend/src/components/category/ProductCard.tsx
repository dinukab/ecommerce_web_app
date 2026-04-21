import { useState } from 'react';
import Link from 'next/link';
import { type Product, type ProductStatus } from '../../api/Productapi';

const PLACEHOLDER = 'https://placehold.co/400x400/e8eaff/6366f1?text=No+Image';

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-amber-100 text-amber-700 border border-amber-200',
  'New Arrival': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Sale:          'bg-red-100 text-red-600 border border-red-200',
};

const STATUS_STYLES: Record<ProductStatus, string> = {
  'out-of-stock': 'text-red-500',
  'low-stock':    'text-amber-500',
  'in-stock':     'text-emerald-500',
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  'out-of-stock': 'Out of Stock',
  'low-stock':    'Low Stock',
  'in-stock':     'In Stock',
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [imgSrc, setImgSrc] = useState<string>(product.images?.[0] || PLACEHOLDER);
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  const status: ProductStatus =
    product.status ??
    (product.stock === 0
      ? 'out-of-stock'
      : product.stock <= product.lowStockThreshold
      ? 'low-stock'
      : 'in-stock');

  const discount =
    product.costPrice > 0
      ? Math.round(((product.costPrice - product.sellingPrice) / product.costPrice) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Wishlist button */}
      <button
        onClick={(e) => { e.preventDefault(); setWishlisted((w) => !w); }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-400'}`}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Badge */}
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[product.badge] ?? 'bg-gray-100 text-gray-600'}`}>
          {product.badge}
        </span>
      )}

      {/* Discount pill */}
      {discount > 0 && (
        <span className="absolute top-10 left-3 z-10 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
          {discount}% off
        </span>
      )}

      {/* Image */}
      <div className="relative h-52 bg-gray-50 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(PLACEHOLDER)}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />
        {status === 'out-of-stock' && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">
          {product.brand || 'OneShop'}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-amber-400' : 'fill-gray-200'}`}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-indigo-700">
              RS.{product.sellingPrice.toLocaleString()}
            </p>
            {product.costPrice > product.sellingPrice && (
              <p className="text-xs text-gray-400 line-through">
                RS.{product.costPrice.toLocaleString()}
              </p>
            )}
          </div>
          <span className={`text-xs font-medium ${STATUS_STYLES[status]}`}>
            {status !== 'out-of-stock' && `${product.stock} `}
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>
    </Link>
  );
}
