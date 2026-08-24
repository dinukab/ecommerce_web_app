import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange?: (quantity: number) => void;
  max?: number;
  min?: number;
  unit?: string;
  isWeightBased?: boolean;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  max,
  min = 1,
  unit,
  isWeightBased,
}: QuantitySelectorProps) {
  const isKg = isWeightBased || unit === 'kg' || (typeof unit === 'string' && unit.toLowerCase().includes('kg'));
  const [inputVal, setInputVal] = useState<string>(String(quantity));

  useEffect(() => {
    setInputVal(String(quantity));
  }, [quantity]);

  const commitValue = (valStr: string) => {
    let parsed = parseFloat(valStr);
    if (isNaN(parsed) || parsed < min) {
      parsed = min;
    } else if (max !== undefined && parsed > max) {
      parsed = max;
    } else {
      parsed = isKg ? Number(parsed.toFixed(2)) : Math.round(parsed);
    }
    setInputVal(String(parsed));
    if (onChange) {
      onChange(parsed);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputVal(newVal);

    const parsed = parseFloat(newVal);
    if (!isNaN(parsed) && parsed >= min && (max === undefined || parsed <= max)) {
      if (onChange) {
        onChange(isKg ? Number(parsed.toFixed(2)) : Math.round(parsed));
      }
    }
  };

  const handleBlur = () => {
    commitValue(inputVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue(inputVal);
      e.currentTarget.blur();
    }
  };

  let unitLabel = '';
  if (isKg) {
    unitLabel = 'kg';
  } else if (unit) {
    unitLabel = unit;
  } else {
    unitLabel = quantity === 1 ? 'item' : 'items';
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrease}
        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </button>

      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-brand">
        <input
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-10 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
        />
        {unitLabel && (
          <span className="text-xs font-bold text-gray-700 ml-1 select-none">
            {unitLabel}
          </span>
        )}
      </div>

      <button
        onClick={onIncrease}
        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={max !== undefined && quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

