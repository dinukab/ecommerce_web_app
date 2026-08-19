// ---------------------------------------------------------------------------
// Tenant-neutral fallback branding.
//
// Real values come from GET /api/store-settings, which the backend resolves
// from the requesting tenant's database (see StoreProvider). These constants
// only fill the gap before that request resolves, so they must NOT name any
// particular store — a hardcoded tenant here leaks one store's branding onto
// every other storefront during first paint.
// ---------------------------------------------------------------------------

export const storeConfig = {
  storeName:      'OneShop',
  currency:       'LKR',
  currencyLocale: 'en-LK',
  address:        '',
  phone:          '',
  email:          '',
  logoUrl:        '/logo-placeholder.svg',
  primaryColor:   '#0891b2',
  primaryDark:    '#0e7490',
  primaryLight:   '#a5f3fc',
} as const;

export type StoreConfig = typeof storeConfig;
