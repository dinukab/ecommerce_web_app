'use client';

import { IShippingInfo } from '@/types/shippingInfo';

interface ShippingInfoSectionProps {
  item: IShippingInfo;
}

export default function ShippingInfoSection({
  item
}: ShippingInfoSectionProps) {
  const renderMetadata = () => {
    if (!item.metadata) return null;

    const { shippingCost, deliveryDays, regions, availability } =
      item.metadata;

    return (
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {shippingCost !== undefined && (
          <div className="bg-brand-light p-3 rounded">
            <p className="text-gray-600">Cost</p>
            <p className="font-semibold text-brand">Rs.{shippingCost}</p>
          </div>
        )}

        {deliveryDays && (
          <div className="bg-green-50 p-3 rounded">
            <p className="text-gray-600">Delivery</p>
            <p className="font-semibold text-green-600">{deliveryDays}</p>
          </div>
        )}

        {availability && (
          <div className="bg-yellow-50 p-3 rounded col-span-2">
            <p className="text-gray-600">Availability</p>
            <p className="font-semibold text-yellow-600">{availability}</p>
          </div>
        )}

        {regions && regions.length > 0 && (
          <div className="bg-purple-50 p-3 rounded col-span-2">
            <p className="text-gray-600 mb-2">Regions</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-light0">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {item.title}
      </h3>

      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {item.description}
      </p>

      {item.content?.details && (
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-700 italic">
          {item.content.details}
        </div>
      )}

      {renderMetadata()}
    </div>
  );
}

