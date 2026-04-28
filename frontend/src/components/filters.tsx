'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSection {
  title: string;
  options: string[];
}

export default function Filters() {
  const [openSections, setOpenSections] = useState<string[]>(['Category', 'Price Range']);

  const filterSections: FilterSection[] = [
    {
      title: 'Category',
      options: ['Electronics', 'Headphones', 'Speakers', 'Accessories', 'Wearables'],
    },
    {
      title: 'Price Range',
      options: ['Under Rs 1000', 'Rs 1000 - Rs 2500', 'Rs 2500 - Rs 5000', 'Above Rs 5000'],
    },
    {
      title: 'Brand',
      options: ['OneShop', 'Brand A', 'Brand B', 'Brand C', 'Brand D'],
    },
    {
      title: 'Rating',
      options: ['4 Stars & Up', '3 Stars & Up', '2 Stars & Up', '1 Star & Up'],
    },
  ];

  const toggleSection = (title: string) => {
    if (openSections.includes(title)) {
      setOpenSections(openSections.filter((s) => s !== title));
    } else {
      setOpenSections([...openSections, title]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button className="text-sm text-brand hover:text-brand-dark font-medium">
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {filterSections.map((section) => (
          <div key={section.title} className="border-b border-gray-200 pb-4 last:border-0">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-medium text-gray-900">{section.title}</span>
              {openSections.includes(section.title) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {openSections.includes(section.title) && (
              <div className="space-y-2">
                {section.options.map((option) => (
                  <label key={option} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand-light0"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

