const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Review {
  _id: string;
  product: string;
  user: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
}

export const fetchProductReviews = async (productId: string) => {
  const res = await fetch(`${BASE}/reviews/${productId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  const json = await res.json();
  return json.data as Review[];
};

export const submitReview = async (productId: string, data: { user: string, rating: number, title: string, text: string }) => {
  const res = await fetch(`${BASE}/reviews/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
};
