import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="relative inline-block w-full max-w-xs" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={handleButtonClick}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-800 text-sm flex justify-between items-center transition-all duration-200 hover:border-brand hover:shadow-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      >
        <span className="truncate pr-2">
          {loading ? 'Loading...' : selectedCategory?.name || 'Select Category'}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
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
              className={`px-4 py-3 flex items-center justify-between cursor-pointer group transition-colors duration-200 hover:bg-brand-light ${
                index !== categories.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* Category Info */}
              <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-3">
                <span className="font-medium text-gray-900 text-sm truncate group-hover:text-brand-dark transition-colors">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Chevron Icon */}
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-all duration-200 group-hover:translate-x-1 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
