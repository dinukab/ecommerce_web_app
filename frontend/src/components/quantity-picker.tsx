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

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={decrease}
        disabled={value <= min}
      >
        −
      </Button>

      <Input
        type="number"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="w-14 text-center"
        min={min}
        max={max}
      />

      <Button
        variant="outline"
        size="icon"
        onClick={increase}
        disabled={value >= max}
      >
        +
      </Button>
    </div>
  );
}
