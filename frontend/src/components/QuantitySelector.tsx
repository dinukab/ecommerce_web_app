'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onDecrease}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-lg font-medium w-12 text-center">{quantity}</span>
      <button
        onClick={onIncrease}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={max !== undefined && quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

