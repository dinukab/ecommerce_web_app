import axios, { AxiosInstance, AxiosError } from 'axios';
import { IContactFormData, IContactMessage, IApiResponse } from '@/types/contact';

/**
 * Contact Service
 * Handles all contact-related API calls
 */
class ContactService {
  private api: AxiosInstance;
  private apiUrl: string;

  constructor() {
    // Use environment variable or default to localhost with /api suffix
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Ensure URL ends with / for correct relative path resolution in Axios
    const formattedBaseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;

    this.api = axios.create({
      baseURL: formattedBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request Interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL
        });
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('📥 API Response:', response.data);
        return response;
      },
      (error) => {
        const errorDetails = {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        };
        console.error('❌ Response Error:', errorDetails);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit Contact Form
   * @param formData - Contact form data
   * @returns API response with submitted message data
   */
  async submitContactForm(
    formData: IContactFormData
  ): Promise<IApiResponse<IContactMessage>> {
    try {
      const response = await this.api.post<IApiResponse<IContactMessage>>(
        'contact',
        formData
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get All Contact Messages (Admin)
   * @returns List of all contact messages
   */
  async getAllMessages(): Promise<IApiResponse<IContactMessage[]>> {
    try {
      const response = await this.api.get<IApiResponse<IContactMessage[]>>(
        'contact'
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get Single Contact Message (Admin)
   * @param id - Message ID
   * @returns Single contact message
   */
  async getMessageById(id: string): Promise<IApiResponse<IContactMessage>> {
    try {
      const response = await this.api.get<IApiResponse<IContactMessage>>(
        `contact/${id}`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update Message Status (Admin)
   * @param id - Message ID
   * @param status - New status
   * @param adminNotes - Admin notes
   * @returns Updated message
   */
  async updateMessageStatus(
    id: string,
    status: 'new' | 'read' | 'responded',
    adminNotes?: string
  ): Promise<IApiResponse<IContactMessage>> {
    try {
      const response = await this.api.patch<IApiResponse<IContactMessage>>(
        `contact/${id}`,
        {
          status,
          adminNotes: adminNotes || ''
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete Contact Message (Admin)
   * @param id - Message ID
   * @returns Deletion confirmation
   */
  async deleteMessage(id: string): Promise<IApiResponse> {
    try {
      const response = await this.api.delete<IApiResponse>(`contact/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate Contact Form Data
   * @param data - Form data to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateFormData(data: IContactFormData): string[] {
    const errors: string[] = [];

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length > 50) {
      errors.push('Name cannot be longer than 50 characters');
    }

    // Email validation
    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Please provide a valid email address');
    }

    // Subject validation
    if (!data.subject || data.subject.trim().length === 0) {
      errors.push('Subject is required');
    } else if (data.subject.length > 100) {
      errors.push('Subject cannot be longer than 100 characters');
    }

    // Message validation
    if (!data.message || data.message.trim().length === 0) {
      errors.push('Message is required');
    } else if (data.message.length < 10) {
      errors.push('Message must be at least 10 characters');
    } else if (data.message.length > 5000) {
      errors.push('Message cannot be longer than 5000 characters');
    }

    return errors;
  }

  /**
   * Email Validation Helper
   * @param email - Email to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  /**
   * Error Handler
   * @param error - Error to handle
   * @returns Formatted error response
   */
  private handleError(error: unknown): IApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<IApiResponse>;
      const status = axiosError.response?.status;

      // Handle specific error codes
      if (status === 400) {
        return {
          success: false,
          message: axiosError.response?.data?.message || 'Invalid request data',
          error: 'validation_error'
        };
      }

      if (status === 404) {
        return {
          success: false,
          message: 'Resource not found',
          error: 'not_found'
        };
      }

      if (status === 500) {
        return {
          success: false,
          message: 'Server error. Please try again later.',
          error: 'server_error'
        };
      }

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

// Export singleton instance
export default new ContactService();
