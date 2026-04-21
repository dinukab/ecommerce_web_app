import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  storeId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryDropdownProps {
  onCategorySelect?: (category: Category) => void;
  storeId?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ 
  onCategorySelect,
  storeId = 'STORE-2025-001'
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [storeId]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/categories?storeId=${storeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const responseData = await response.json();
      setCategories(responseData.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsOpen(false);
    
    // Use slug if available, fall back to name-based slug
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/category/${slug}`);
    
    // Call parent callback if provided
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block w-full max-w-xs">
      {/* Button */}
      <button
        onClick={handleButtonClick}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-800 text-base flex justify-between items-center transition-all duration-300 hover:border-blue-600 hover:shadow-md focus:outline-none focus:border-blue-600"
      >
        <span>
          {loading ? 'Loading...' : selectedCategory?.name || 'Select Category'}
        </span>
        <span
          className={`text-xs transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Error State */}
          {error && (
            <div className="px-4 py-4 bg-red-50 text-red-600 text-center text-sm">
              Error: {error}
            </div>
          )}

          {/* Empty State */}
          {categories.length === 0 && !error && (
            <div className="px-4 py-4 text-gray-500 text-center text-sm">
              No categories found
            </div>
          )}

          {/* Category Items */}
          {categories.map((category, index) => (
            <div
              key={category._id}
              onClick={() => handleSelectCategory(category)}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-gray-100 ${
                index !== categories.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Icon */}
              <span className="text-2xl min-w-fit">{category.icon}</span>

              {/* Category Info */}
              <div className="flex-1 flex flex-col gap-1">
                <span className="font-medium text-gray-900 text-sm">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  {category.productCount} product
                  {category.productCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Color Dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
                title={category.color}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;