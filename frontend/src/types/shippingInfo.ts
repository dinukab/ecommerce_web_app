export type ShippingInfoCategory =
  | 'Shipping Options'
  | 'Delivery Areas'
  | 'Form Fields'
  | 'Shipping FAQs'
  | 'Shipping Policy'
  | 'Other';

export type ShippingInfoType = 'text' | 'faq' | 'policy' | 'guide' | 'info';

export interface IShippingContent {
  question?: string;
  answer?: string;
  details?: string;
}

export interface IShippingMetadata {
  shippingCost?: number;
  deliveryDays?: string;
  regions?: string[];
  availability?: string;
}

export interface IShippingInfo {
  _id: string;
  title: string;
  description: string;
  category: ShippingInfoCategory;
  type: ShippingInfoType;
  content?: IShippingContent;
  metadata?: IShippingMetadata;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingInfoResponse {
  success: boolean;
  count?: number;
  message?: string;
  data?: IShippingInfo | IShippingInfo[];
  error?: string;
}

export interface ICategoryCount {
  name: ShippingInfoCategory;
  count: number;
}

export interface IShippingInfoFilters {
  category?: ShippingInfoCategory;
  type?: ShippingInfoType;
}
