const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  productCount?: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data;
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  const res = await fetch(`${BASE}/categories/${slug}`);
  if (!res.ok) throw new Error('Category not found');
  const json = await res.json();
  return json.data;
};
