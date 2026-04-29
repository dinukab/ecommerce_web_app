import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IShippingInfo,
  IShippingInfoResponse,
  ICategoryCount,
  IShippingInfoFilters
} from '@/types/shippingInfo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ShippingInfoService {
  private api: AxiosInstance;

  constructor() {
    // Use environment variable or default to localhost with /api suffix
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Ensure URL ends with / for correct relative path resolution in Axios
    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    this.api = axios.create({
      baseURL: formattedBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get all shipping information with optional filtering
   */
  async getShippingInfo(
    filters?: IShippingInfoFilters
  ): Promise<IShippingInfoResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) {
        params.append('category', filters.category);
      }

      if (filters?.type) {
        params.append('type', filters.type);
      }

      const response = await this.api.get<IShippingInfoResponse>(
        `shipping-info?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all categories with counts
   */
  async getCategories(): Promise<IShippingInfoResponse> {
    try {
      const response = await this.api.get<IShippingInfoResponse>(
        'shipping-info/categories'
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get single shipping info by ID
   */
  async getShippingInfoById(id: string): Promise<IShippingInfoResponse> {
    try {
      const response = await this.api.get<IShippingInfoResponse>(
        `shipping-info/${id}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create new shipping info (Admin only)
   */
  async createShippingInfo(
    data: Omit<
      IShippingInfo,
      '_id' | 'createdAt' | 'updatedAt'
    >
  ): Promise<IShippingInfoResponse> {
    try {
      const response = await this.api.post<IShippingInfoResponse>(
        'shipping-info',
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update shipping info (Admin only)
   */
  async updateShippingInfo(
    id: string,
    data: Partial<Omit<IShippingInfo, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IShippingInfoResponse> {
    try {
      const response = await this.api.patch<IShippingInfoResponse>(
        `shipping-info/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete shipping info (Admin only)
   */
  async deleteShippingInfo(id: string): Promise<IShippingInfoResponse> {
    try {
      const response = await this.api.delete<IShippingInfoResponse>(
        `shipping-info/${id}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate shipping info data
   */
  validateShippingInfo(data: any): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title cannot be longer than 200 characters');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    } else if (data.description.length > 5000) {
      errors.push('Description cannot be longer than 5000 characters');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    return errors;
  }

  /**
   * Error handler
   */
  private handleError(error: unknown): IShippingInfoResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<IShippingInfoResponse>;
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          axiosError.message ||
          'An error occurred. Please try again.',
        error: 'api_error'
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: 'unknown_error'
    };
  }
}

export default new ShippingInfoService();
