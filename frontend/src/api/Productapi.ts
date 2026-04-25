const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type ProductStatus = 'in-stock' | 'out-of-stock' | 'low-stock';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  status?: ProductStatus;
  badge?: string;
  brand?: string;
  rating: number;
  numReviews: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchProducts = async ({ category = '', page = 1, limit = 20, sort = 'name', search = '' } = {}) => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), sort });
  if (category) params.set('category', category);
  if (search) params.set('search', search);

  const res = await fetch(`${BASE}/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json(); // returns { success, data, pagination }
};

export const fetchProductById = async (id: string) => {
  const res = await fetch(`${BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  const json = await res.json();
  return json.data as Product;
};
