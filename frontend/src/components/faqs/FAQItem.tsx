'use client';

import { useState } from 'react';
import { IFAQ } from '@/types/faq';
import faqService from '@/services/faqService';

interface FAQItemProps {
  faq: IFAQ;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function FAQItem({ faq, isExpanded, onToggle }: FAQItemProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [helpfulCount, setHelpfulCount] = useState(faq.helpful);
  const [notHelpfulCount, setNotHelpfulCount] = useState(faq.notHelpful);

  const handleFeedback = async (isHelpful: boolean) => {
    if (helpful === isHelpful) {
      return; // Already voted
    }

    const response = await faqService.markFAQFeedback(faq._id, isHelpful);

    if (response.success) {
      setHelpful(isHelpful);
      setFeedbackMessage('Thank you for your feedback!');

      // Update counts
      if (isHelpful) {
        setHelpfulCount(helpfulCount + 1);
      } else {
        setNotHelpfulCount(notHelpfulCount + 1);
      }

      // Clear message after 3 seconds
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const helpfulPercentage =
    helpfulCount + notHelpfulCount > 0
      ? Math.round((helpfulCount / (helpfulCount + notHelpfulCount)) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Question Button */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between transition"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {faq.question}
          </h3>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-brand-light text-brand-dark text-xs font-medium rounded-full">
              {faq.category}
            </span>
            <span className="text-xs text-gray-500">
              {faq.views} {faq.views === 1 ? 'view' : 'views'}
            </span>
          </div>
        </div>

        {/* Chevron Icon */}
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

      {/* Answer Section */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {/* Answer */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {faq.answer}
            </p>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Was this helpful?
            </p>

            <div className="flex items-center gap-4">
              {/* Helpful Button */}
              <button
                onClick={() => handleFeedback(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  helpful === true
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10.5a1.5 1.5 0 113 0v-7a1.5 1.5 0 01-3 0v7zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="text-sm font-medium">Yes</span>
                {helpfulCount > 0 && (
                  <span className="text-xs">({helpfulCount})</span>
                )}
              </button>

              {/* Not Helpful Button */}
              <button
                onClick={() => handleFeedback(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  helpful === false
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-7a1.5 1.5 0 013 0v7zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
                <span className="text-sm font-medium">No</span>
                {notHelpfulCount > 0 && (
                  <span className="text-xs">({notHelpfulCount})</span>
                )}
              </button>

              {/* Feedback Message */}
              {feedbackMessage && (
                <div className="ml-auto text-sm text-green-600 font-medium animate-fade-in">
                  ✓ {feedbackMessage}
                </div>
              )}
            </div>

            {/* Helpfulness Indicator */}
            {helpfulCount + notHelpfulCount > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                <div className="flex items-center justify-between mb-1">
                  <span>{helpfulPercentage}% found this helpful</span>
                  <span className="text-gray-500">
                    {helpfulCount + notHelpfulCount} votes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${helpfulPercentage}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

