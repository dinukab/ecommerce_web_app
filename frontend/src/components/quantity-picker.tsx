"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuantityPickerProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityPickerProps) {
  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    onChange(Math.max(min, Math.min(max, raw)));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={decrease}
        disabled={value <= min}
        className="h-8 w-8 border-gray-500 bg-gray-400 text-white hover:bg-gray-400 disabled:bg-slate-400 disabled:text-white"
        aria-label="Decrease quantity"
      >
        −
      </Button>

      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="h-8 w-10 border-slate-300 bg-slate-50 px-1 text-center font-bold text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={min}
        max={max}
      />

      <Button
        variant="outline"
        size="icon"
        onClick={increase}
        disabled={value >= max}
        className="h-8 w-8 border-transparent bg-gray-500 text-white hover:bg-gray-600 disabled:bg-slate-400 disabled:text-white"
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}
