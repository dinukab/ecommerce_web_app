import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a Sri Lankan phone number.
 * Must start with '07', contain only digits, and be exactly 10 digits long.
 */
export function validateSriLankanPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Phone number is required.';
  }
  const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return 'Phone number must contain only digits.';
  }
  if (!cleaned.startsWith('07')) {
    return 'Phone number must start with 07 (e.g. 0771234567).';
  }
  if (cleaned.length !== 10) {
    return 'Phone number must be exactly 10 digits (e.g. 0771234567).';
  }
  return '';
}

/**
 * Formats quantity with appropriate weight or unit label.
 * e.g. 0.25 kg -> "250g", 0.5 kg -> "500g", 1.5 kg -> "1.5 kg", 2 items -> "2 items"
 */
export function formatWeightOrQuantity(quantity: number, unit?: string, isWeightBased?: boolean): string {
  const isKg = isWeightBased || unit === 'kg' || (typeof unit === 'string' && unit.toLowerCase().includes('kg'));
  if (isKg) {
    if (quantity < 1) {
      const grams = Math.round(quantity * 1000);
      return `${grams}g`;
    }
    return `${quantity} kg`;
  }
  return `${quantity} ${unit || 'item'}${quantity !== 1 ? 's' : ''}`;
}

