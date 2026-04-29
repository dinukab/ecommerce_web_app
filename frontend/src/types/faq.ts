export type FAQCategory =
  | 'General'
  | 'Shipping'
  | 'Returns'
  | 'Payment'
  | 'Account'
  | 'Products'
  | 'Orders'
  | 'Technical';

export interface IFAQ {
  _id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  order: number;
  isActive: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFAQResponse<T = any> {
  success: boolean;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  message?: string;
  data?: T;
  error?: string;
}

export interface ICategoryCount {
  name: FAQCategory;
  count: number;
}

export interface IFAQFilters {
  category?: FAQCategory | 'All';
  search?: string;
  page?: number;
  limit?: number;
}
