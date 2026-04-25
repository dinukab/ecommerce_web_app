'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Truck, MapPin, Clock } from 'lucide-react';

interface DeliveryCalculatorProps {
  onCalculate?: (fee: number, days: number, district: string) => void;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const DeliveryCalculator: React.FC<DeliveryCalculatorProps> = ({ onCalculate }) => {
  const [district, setDistrict] = useState('');
  const [method, setMethod] = useState('standard');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!district) return;
    setLoading(true);
    try {
      const res = await api.calculateDeliveryFee({ district, deliveryMethod: method });
      if (res.success && res.data) {
        setResult(res.data);
        if (onCalculate) {
          onCalculate(res.data.fee, res.data.estimatedDays, district);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [district, method]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Delivery Calculator</h3>
          <p className="text-xs text-gray-500">Estimate fees and delivery time</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select District
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm appearance-none outline-none transition-all"
            >
              <option value="">Choose your district...</option>
              {DISTRICTS.sort().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Delivery Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['standard', 'express'].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  method === m 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Delivery Fee</span>
              <span className="text-sm font-bold text-gray-900">
                {result.fee === 0 ? 'FREE' : `LKR ${result.fee.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estimated Delivery</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                <Clock className="w-4 h-4" />
                <span>{result.estimatedDays} {result.estimatedDays === 1 ? 'Day' : 'Days'}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center pt-2 italic">
              Delivery to {district} via {method} shipping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryCalculator;
