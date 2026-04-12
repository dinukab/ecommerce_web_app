'use client';

import { FAQCategory, ICategoryCount } from '@/types/faq';

interface FAQCategoriesProps {
  categories: ICategoryCount[];
  selectedCategory: FAQCategory | 'All';
  onCategoryChange: (category: FAQCategory | 'All') => void;
}

export default function FAQCategories({
  categories,
  selectedCategory,
  onCategoryChange
}: FAQCategoriesProps) {
  const totalFAQs = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>

      <div className="space-y-2">
        {/* All FAQs */}
        <button
          onClick={() => onCategoryChange('All')}
          className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
            selectedCategory === 'All'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="font-medium">All FAQs</span>
          <span
            className={`text-sm font-semibold ${
              selectedCategory === 'All'
                ? 'bg-white text-blue-600'
                : 'bg-gray-200 text-gray-700'
            } px-3 py-1 rounded-full`}
          >
            {totalFAQs}
          </span>
        </button>

        {/* Category Items */}
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryChange(category.name)}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
              selectedCategory === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <span
              className={`text-sm font-semibold ${
                selectedCategory === category.name
                  ? 'bg-white text-blue-600'
                  : 'bg-gray-200 text-gray-700'
              } px-3 py-1 rounded-full`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* No categories message */}
      {categories.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No categories available
        </p>
      )}
    </div>
  );
}
