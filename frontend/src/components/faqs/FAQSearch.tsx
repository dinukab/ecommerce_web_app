'use client';

import { useState, useCallback } from 'react';

interface FAQSearchProps {
  onSearch: (query: string) => void;
}

export default function FAQSearch({ onSearch }: FAQSearchProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search FAQs..."
        value={searchInput}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light0 focus:border-transparent outline-none transition"
      />

      {searchInput && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

