"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type QuantityPickerProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  isWeightBased?: boolean;
};

export default function QuantityPicker({
  value,
  onChange,
  step = 1,
  min,
  max = 99,
  unit,
  isWeightBased,
}: QuantityPickerProps) {
  const isKg = isWeightBased || unit === 'kg' || (typeof unit === 'string' && unit.toLowerCase().includes('kg'));
  const actualMin = min ?? (isKg ? 0.25 : 1);
  const actualStep = isKg ? 0.25 : step;

  const [inputVal, setInputVal] = useState<string>(String(value));

  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const commitValue = (valStr: string) => {
    let parsed = parseFloat(valStr);
    if (isNaN(parsed) || parsed < actualMin) {
      parsed = actualMin;
    } else if (parsed > max) {
      parsed = max;
    } else {
      parsed = isKg ? Number(parsed.toFixed(2)) : Math.round(parsed);
    }
    setInputVal(String(parsed));
    onChange(parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputVal(newVal);

    const parsed = parseFloat(newVal);
    if (!isNaN(parsed) && parsed >= actualMin && parsed <= max) {
      onChange(isKg ? Number(parsed.toFixed(2)) : Math.round(parsed));
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

  const increase = () => {
    const nextVal = Math.min(max, Number((value + actualStep).toFixed(2)));
    commitValue(String(nextVal));
  };

  const decrease = () => {
    const nextVal = Math.max(actualMin, Number((value - actualStep).toFixed(2)));
    commitValue(String(nextVal));
  };

  let unitLabel = '';
  if (isKg) {
    unitLabel = 'kg';
  } else if (unit) {
    unitLabel = unit;
  } else {
    unitLabel = value === 1 ? 'item' : 'items';
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        onClick={decrease}
        disabled={value <= actualMin}
        className="h-8 w-8 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
        aria-label="Decrease quantity"
      >
        −
      </Button>

      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
        <input
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-10 text-center text-xs font-bold text-gray-900 bg-transparent focus:outline-none"
        />
        {unitLabel && (
          <span className="text-xs font-bold text-gray-700 ml-1 select-none">
            {unitLabel}
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={increase}
        disabled={value >= max}
        className="h-8 w-8 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}

