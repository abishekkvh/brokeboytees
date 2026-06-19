/**
 * Global application constants
 */

export const APP_CONFIG = {
  NEW_DROP_DURATION_DAYS: 45,
  SHIPPING_THRESHOLD: 1999,
  DEFAULT_SHIPPING_FEE: 99,
  TAX_RATE: 0.12, // 12% GST
  CURRENCY: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
} as const;

export const CATEGORIES = [
  { value: 'hoodie', label: 'Hoodies' },
  { value: 't-shirt', label: 'T-Shirts' },
  { value: 'shirt', label: 'Shirts' },
] as const;

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
