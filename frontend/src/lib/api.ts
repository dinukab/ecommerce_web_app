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
  price: number;
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
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
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

  // Health check
  async healthCheck(): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>('/health');
  }
}

export const api = new ApiService(API_BASE_URL);
