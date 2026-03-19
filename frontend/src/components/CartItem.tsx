'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@/types';
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '@/context/CartContext';
import React from 'react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{item.category}</p>
          <p className="text-xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
        </div>

        <div className="flex flex-col items-end space-y-4">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
            max={item.stock}
          />
          
          <button
            onClick={() => removeFromCart(item.id)}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Remove</span>
          </button>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
