import { Metadata } from 'next';
import FAQsContent from '@/components/faqs/FAQsContent';

export const metadata: Metadata = {
  title: 'FAQs | OneShop',
  description:
    'Frequently asked questions about OneShop. Find answers to common questions.',
  openGraph: {
    title: 'FAQs | OneShop',
    description: 'Frequently asked questions about OneShop',
    type: 'website'
  }
};

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our products, shipping,
            returns, and more.
          </p>
        </div>

        {/* FAQs Content */}
        <FAQsContent />
      </div>
    </div>
  );
}

