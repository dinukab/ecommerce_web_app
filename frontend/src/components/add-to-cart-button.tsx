"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

type AddToCartButtonProps = {
  onAdd: () => void;
  disabled?: boolean;
};

export default function AddToCartButton({
  onAdd,
  disabled = false,
}: AddToCartButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={onAdd}
      disabled={disabled}
      className="h-10 w-10 rounded-full shadow hover:bg-blue-50"
      aria-label="Add to cart"
    >
      <ShoppingCart className="h-5 w-5" />
    </Button>
  );
}
