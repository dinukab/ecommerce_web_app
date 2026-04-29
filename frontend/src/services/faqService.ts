 import axios, { AxiosInstance, AxiosError } from 'axios';
import { IFAQ, IFAQResponse, ICategoryCount, IFAQFilters } from '@/types/faq';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class FAQService {
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
   * Get all FAQs with optional filtering
   */
  async getFAQs(filters?: IFAQFilters): Promise<IFAQResponse<IFAQ[]>> {
    try {
      const params = new URLSearchParams();

      if (filters?.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (filters?.page) {
        params.append('page', filters.page.toString());
      }

      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await this.api.get<IFAQResponse>(
        `faqs?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get FAQ categories with counts
   */
  async getCategories(): Promise<IFAQResponse<ICategoryCount[]>> {
    try {
      const response = await this.api.get<IFAQResponse>('faqs/categories');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get single FAQ by ID
   */
  async getFAQById(id: string): Promise<IFAQResponse<IFAQ>> {
    try {
      const response = await this.api.get<IFAQResponse>(`faqs/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mark FAQ as helpful or not helpful
   */
  async markFAQFeedback(
    id: string,
    helpful: boolean
  ): Promise<IFAQResponse<IFAQ>> {
    try {
      const response = await this.api.post<IFAQResponse>(
        `faqs/helpful/${id}`,
        { helpful }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create new FAQ (Admin only)
   */
  async createFAQ(faqData: Omit<IFAQ, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'helpful' | 'notHelpful'>): Promise<IFAQResponse<IFAQ>> {
    try {
      const response = await this.api.post<IFAQResponse>(
        'faqs',
        faqData
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update FAQ (Admin only)
   */
  async updateFAQ(
    id: string,
    faqData: Partial<Omit<IFAQ, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IFAQResponse<IFAQ>> {
    try {
      const response = await this.api.patch<IFAQResponse>(
        `faqs/${id}`,
        faqData
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete FAQ (Admin only)
   */
  async deleteFAQ(id: string): Promise<IFAQResponse<void>> {
    try {
      const response = await this.api.delete<IFAQResponse>(`faqs/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate FAQ data
   */
  validateFAQData(data: any): string[] {
    const errors: string[] = [];

    if (!data.question || data.question.trim().length === 0) {
      errors.push('Question is required');
    } else if (data.question.length > 500) {
      errors.push('Question cannot be longer than 500 characters');
    }

    if (!data.answer || data.answer.trim().length === 0) {
      errors.push('Answer is required');
    } else if (data.answer.length > 5000) {
      errors.push('Answer cannot be longer than 5000 characters');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    return errors;
  }

  /**
   * Error handler
   */
  private handleError(error: unknown): IFAQResponse<any> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<IFAQResponse>;
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

export default new FAQService();
