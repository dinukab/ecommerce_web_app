'use client';

import { useState } from 'react';
import { IFAQ } from '@/types/faq';
import FAQItem from './FAQItem';

interface FAQAccordionProps {
  faqs: IFAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FAQItem
          key={faq._id}
          faq={faq}
          isExpanded={expandedId === faq._id}
          onToggle={() => toggleExpand(faq._id)}
        />
      ))}
    </div>
  );
}


