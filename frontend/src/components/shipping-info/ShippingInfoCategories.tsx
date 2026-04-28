'use client';

import { ShippingInfoCategory } from '@/types/shippingInfo';

interface ShippingInfoCategoriesProps {
  selectedCategory: ShippingInfoCategory | 'All';
  onCategoryChange: (category: ShippingInfoCategory | 'All') => void;
}

export default function ShippingInfoCategories({
  selectedCategory,
  onCategoryChange
}: ShippingInfoCategoriesProps) {
  const categories: (ShippingInfoCategory | 'All')[] = [
    'All',
    'Shipping Options',
    'Delivery Areas',
    'Form Fields',
    'Shipping FAQs',
    'Shipping Policy',
    'Other'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
              selectedCategory === category
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

