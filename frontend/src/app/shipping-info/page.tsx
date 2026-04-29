import { Metadata } from 'next';
import ShippingInfoContent from '@/components/shipping-info/ShippingInfoContent';

export const metadata: Metadata = {
  title: 'Shipping Information | OneShop',
  description:
    'Learn about our shipping process, delivery times, costs, and policies.',
  openGraph: {
    title: 'Shipping Information | OneShop',
    description: 'Shipping information and delivery details',
    type: 'website'
  }
};

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping Information
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about shipping your orders
          </p>
        </div>

        {/* Shipping Info Content */}
        <ShippingInfoContent />
      </div>
    </div>
  );
}


