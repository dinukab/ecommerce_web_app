'use client';

import { useState } from 'react';
import { IShippingInfo } from '@/types/shippingInfo';

interface ShippingInfoFAQProps {
  item: IShippingInfo;
}

export default function ShippingInfoFAQ({ item }: ShippingInfoFAQProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const question = item.content?.question || item.title;
  const answer = item.content?.answer || item.description;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between transition"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>

        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {answer}
          </p>

          {item.metadata?.shippingCost && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-gray-600">Cost:</p>
              <p className="font-semibold text-blue-600">
                Rs.{item.metadata.shippingCost}
              </p>
            </div>
          )}

          {item.metadata?.deliveryDays && (
            <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-gray-600">Delivery Time:</p>
              <p className="font-semibold text-green-600">
                {item.metadata.deliveryDays}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}