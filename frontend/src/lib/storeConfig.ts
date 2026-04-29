// ---------------------------------------------------------------------------
// Store configuration — map your MongoDB store document here.
// Update this file whenever the store settings change.
// ---------------------------------------------------------------------------

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const storeConfig = {
  _id:            '69e9a452f0392b2568712f9d',
  storeId:        '69e539fd180ff885ce56ca57',
  storeName:      'Open Door',
  currency:       'LKR',
  currencyLocale: 'en-LK',
  address:        'No. 1, Main Street, Colombo 01',
  phone:          '+94 11 234 5678',
  email:          'info@opendoor.lk',
  logoUrl:        "/uploads/logo/store-logo-oneshop_open_door.png?v=1777216362745",
  primaryColor:   '#0891b2',   // cyan-600
  primaryDark:    '#0e7490',   // cyan-700
  primaryLight:   '#a5f3fc',   // cyan-200
} as const;

export type StoreConfig = typeof storeConfig;
