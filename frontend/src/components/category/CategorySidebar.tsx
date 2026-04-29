'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Category } from '@/api/Categoryapi';

interface Props {
  categories: Category[];
  activeSlug: string | undefined;
}

export default function CategorySidebar({ categories, activeSlug }: Props) {
  const pathname = usePathname();
  const isAllActive = pathname === '/category/all';

  const getLinkClass = (slug: string) => {
    const isActive = pathname === `/category/${slug}`;
    return `flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-brand-light ${
      isActive
        ? 'bg-brand-light text-brand-dark font-semibold border-r-4 border-brand-light0'
        : 'text-gray-600'
    }`;
  };

  return (
    <aside className="w-60 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
        <div className="px-5 py-4 bg-gradient-to-r from-brand to-violet-600">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">All Categories</h2>
        </div>

        <ul className="divide-y divide-gray-50 max-h-[calc(100vh-160px)] overflow-y-auto">
          {/* All items */}
          <li>
            <Link
              href="/category/all"
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-brand-light ${
                isAllActive
                  ? 'bg-brand-light text-brand-dark font-semibold border-r-4 border-brand-light0'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-xl">🛍️</span>
              <p className="font-medium">All Items</p>
            </Link>
          </li>

          {categories.map((cat) => (
            <li key={cat._id}>
              <Link
                href={`/category/${cat.slug}`}
                className={getLinkClass(cat.slug)}
              >
                <span className="text-xl">{cat.icon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.productCount} products</p>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
