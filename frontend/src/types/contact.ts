/**
 * Contact Form Data Interface
 * Represents the form submission data
 */
export interface IContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Contact Message Interface
 * Represents a stored contact message with database fields
 */
export interface IContactMessage extends IContactFormData {
  _id: string;
  status: 'new' | 'read' | 'responded';
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response Interface
 * Generic wrapper for all API responses
 */
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Contact Service Request/Response Types
 */
export type ContactFormSubmissionResponse = IApiResponse<IContactMessage>;
export type ContactMessagesResponse = IApiResponse<IContactMessage[]>;
export type ContactMessageResponse = IApiResponse<IContactMessage>;
