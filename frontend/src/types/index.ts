export interface Product {
  _id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  costPrice?: number;
  images: string[];
  category: string;
  rating: number;
  numReviews: number;
  stock: number;
  lowStockThreshold?: number;
  status?: 'in-stock' | 'out-of-stock' | 'low-stock';
  badge?: string;
  brand?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}
