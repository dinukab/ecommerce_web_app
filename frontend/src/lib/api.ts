const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  sellingPrice: number;
  costPrice?: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  badge?: string;
  featured: boolean;
  specifications: {
    brand: string;
    model: string;
    weight?: string;
    dimensions?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  badge?: string;
  sort?: 'featured' | 'price-low' | 'price-high' | 'rating';
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      phone?: string;
      role: string;
    };
    token: string;
  };
}

export interface AddressEntry {
  _id: string;
  type: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  _id: string;
  type: string;
  cardNumber?: string;
  last4?: string;
  expiry: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  addresses: AddressEntry[];
  paymentMethods?: PaymentMethod[];
  totalOrders?: number;
  totalSpent?: number;
  lastPurchase?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryZone {
  _id: string;
  name: string;
  districts: string[];
  deliveryFee: number;
  estimatedDays: number;
  isActive: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string | any;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode: string;
    phone: string;
  };
  deliveryZone?: string;
  deliveryMethod: 'standard' | 'express' | 'pickup';
  paymentMethod: 'cash-on-delivery' | 'card' | 'bank-transfer' | 'payhere';
  payhereParams?: any;
  payhereHash?: string;
  payhereMerchantId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  itemsPrice: number;
  deliveryFee: number;
  totalPrice: number;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  estimatedDeliveryDate: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  orderNotes?: string;
  payhereMerchantId?: string;
  payhereHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTracking {
  trackingNumber: string;
  status: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  city: string;
  district: string;
  itemsCount: number;
}

export interface StoreSettings {
  _id: string;
  storeId: string;
  storeName: string;
  currency: string;
  currencyLocale: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  primaryColor?: string;
}


class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      console.log('Making request to:', url); // Debug log

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', await response.text());
        throw new Error('Server returned an invalid response. Please make sure the backend is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Product APIs
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Product>>(endpoint);
  }

  async getProductById(id: string): Promise<ApiResponse<{ product: Product; reviews: Review[] }>> {
    return this.request<ApiResponse<{ product: Product; reviews: Review[] }>>(`/products/${id}`);
  }

  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse<Product[]>> {
    return this.request<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`);
  }

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.request<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
  }

  async createProductReview(
    productId: string,
    reviewData: { rating: number; title: string; text: string; user: string }
  ): Promise<ApiResponse<Review>> {
    return this.request<ApiResponse<Review>>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Auth APIs
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(token: string): Promise<ApiResponse<UserProfile>> {
    return this.request<ApiResponse<UserProfile>>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(
    token: string,
    data: { name?: string; phone?: string }
  ): Promise<ApiResponse<UserProfile>> {
    return this.request<ApiResponse<UserProfile>>('/auth/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async changePassword(
    token: string,
    data: { currentPassword: string; newPassword: string }
  ): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>('/auth/password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateAvatar(
    token: string,
    avatar: string
  ): Promise<ApiResponse<{ avatar: string }>> {
    return this.request<ApiResponse<{ avatar: string }>>('/auth/avatar', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { token: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(token: string): Promise<ApiResponse<Order[]>> {
    return this.request<ApiResponse<Order[]>>('/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getMyOrders(token: string): Promise<ApiResponse<Order[]>> {
    return this.request<ApiResponse<Order[]>>('/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrderById(token: string, id: string): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createOrder(token: string, orderData: any): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderData),
    });
  }

  async trackOrder(trackingNumber: string): Promise<ApiResponse<OrderTracking>> {
    return this.request<ApiResponse<OrderTracking>>(`/orders/track/${trackingNumber}`);
  }

  // Delivery APIs
  async getDeliveryZones(): Promise<ApiResponse<DeliveryZone[]>> {
    return this.request<ApiResponse<DeliveryZone[]>>('/delivery/zones');
  }

  async calculateDeliveryFee(data: { district: string; deliveryMethod: string }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/delivery/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addAddress(token: string, addressData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/address', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(addressData),
    });
  }

  async removeAddress(token: string, addressId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/auth/address/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateAddress(token: string, addressId: string, addressData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/auth/address/${addressId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(addressData),
    });
  }

  async addPaymentMethod(token: string, paymentData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/payment-method', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(paymentData),
    });
  }

  async removePaymentMethod(token: string, paymentId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/auth/payment-method/${paymentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Wishlist APIs
  async getWishlist(token: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addToWishlist(token: string, productId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/wishlist', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(token: string, productId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Cart APIs
  async syncCart(
    userId: string,
    items: { productId: string; quantity: number }[]
  ): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ userId, items }),
    });
  }

  // Store Settings APIs
  async getStoreSettings(): Promise<ApiResponse<StoreSettings>> {
    return this.request<ApiResponse<StoreSettings>>('/store-settings');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>('/health');
  }
}

export const api = new ApiService(API_BASE_URL);
