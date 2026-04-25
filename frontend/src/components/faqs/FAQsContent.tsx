'use client';

import { useEffect, useState } from 'react';
import faqService from '@/services/faqService';
import { IFAQ, FAQCategory, ICategoryCount } from '@/types/faq';
import FAQAccordion from './FAQAccordion';
import FAQSearch from './FAQSearch';
import FAQCategories from './FAQCategories';

export default function FAQsContent() {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [categories, setCategories] = useState<ICategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'All'>(
    'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      const response = await faqService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    };

    loadCategories();
  }, []);

  // Fetch FAQs based on filters
  useEffect(() => {
    const loadFAQs = async () => {
      setLoading(true);
      setError('');

      const response = await faqService.getFAQs({
        category: selectedCategory,
        search: searchQuery || undefined,
        page,
        limit: 10
      });

      if (response.success && response.data) {
        setFaqs(response.data);
        setTotalPages(response.pages || 1);
      } else {
        setError(response.message || 'Failed to load FAQs');
        setFaqs([]);
      }

      setLoading(false);
    };

    // Reset page to 1 when filters change
    if (page === 1) {
      loadFAQs();
    } else {
      setPage(1);
    }
  }, [selectedCategory, searchQuery, page]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryChange = (category: FAQCategory | 'All') => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <FAQSearch onSearch={handleSearch} />

      {/* Categories */}
      <FAQCategories
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

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
          <p className="text-gray-600 mt-4">Loading FAQs...</p>
        </div>
      )}

      {/* FAQs Accordion */}
      {!loading && faqs.length > 0 && (
        <div className="space-y-4">
          <FAQAccordion faqs={faqs} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-lg ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && faqs.length === 0 && (
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
            No FAQs found
          </h3>
          <p className="text-gray-600 mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
