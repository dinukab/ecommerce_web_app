'use client';

import { useEffect, useState } from 'react';
import shippingInfoService from '@/services/shippingInfoService';
import { IShippingInfo, ShippingInfoCategory } from '@/types/shippingInfo';
import ShippingInfoSection from './ShippingInfoSection';
import ShippingInfoFAQ from './ShippingInfoFAQ';
import ShippingInfoCategories from './ShippingInfoCategories';

export default function ShippingInfoContent() {
  const [shippingInfo, setShippingInfo] = useState<IShippingInfo[]>([]);
  const [filteredInfo, setFilteredInfo] = useState<IShippingInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    ShippingInfoCategory | 'All'
  >('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch shipping information
  useEffect(() => {
    const loadShippingInfo = async () => {
      setLoading(true);
      setError('');

      const response = await shippingInfoService.getShippingInfo();

      if (response.success && Array.isArray(response.data)) {
        setShippingInfo(response.data as IShippingInfo[]);
      } else {
        setError(response.message || 'Failed to load shipping information');
      }

      setLoading(false);
    };

    loadShippingInfo();
  }, []);

  // Filter information by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredInfo(shippingInfo);
    } else {
      setFilteredInfo(
        shippingInfo.filter((item) => item.category === selectedCategory)
      );
    }
  }, [selectedCategory, shippingInfo]);

  const handleCategoryChange = (category: ShippingInfoCategory | 'All') => {
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading shipping information...</p>
        </div>
      )}

      {/* Category Filter */}
      {!loading && shippingInfo.length > 0 && (
        <ShippingInfoCategories
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Content Sections */}
      {!loading && filteredInfo.length > 0 && (
        <div className="space-y-8">
          {/* Group by category */}
          {['Shipping Options', 'Delivery Areas', 'Form Fields', 'Shipping FAQs', 'Shipping Policy', 'Other'].map(
            (category) => {
              const categoryItems = filteredInfo.filter(
                (item) => item.category === category
              );

              if (categoryItems.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {category}
                  </h2>

                  <div className="space-y-4">
                    {categoryItems.map((item) =>
                      item.type === 'faq' ? (
                        <ShippingInfoFAQ
                          key={item._id}
                          item={item}
                        />
                      ) : (
                        <ShippingInfoSection
                          key={item._id}
                          item={item}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredInfo.length === 0 && shippingInfo.length > 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            No information found
          </h3>
          <p className="text-gray-600 mt-1">
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && shippingInfo.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            No shipping information available
          </h3>
          <p className="text-gray-600 mt-1">
            Please check back later or contact support
          </p>
        </div>
      )}
    </div>
  );
}
