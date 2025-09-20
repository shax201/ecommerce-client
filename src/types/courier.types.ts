// Courier types for frontend

export type CourierType = 'pathao' | 'steadfast';

export interface CourierCredentials {
  _id: string;
  courier: CourierType;
  credentials: {
    // Pathao credentials
    client_id?: string;
    client_secret?: string;
    username?: string;
    password?: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    base_url?: string;
    
    // Steadfast credentials
    api_key?: string;
    secret_key?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourierOrderData {
  // Common order fields
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerArea: string;
  customerPostCode?: string;
  
  // Product details
  items: Array<{
    name: string;
    quantity: number;
    weight: number; // in kg
    price: number;
  }>;
  
  // Delivery details
  deliveryCharge: number;
  totalAmount: number;
  notes?: string;
  
  // Courier-specific fields
  merchantOrderId?: string;
  itemType?: string;
  itemQuantity?: number;
  itemWeight?: number;
  itemPrice?: number;
  deliveryType?: string;
  itemCategory?: string;
  itemSubCategory?: string;
}

export interface CourierResponse {
  success: boolean;
  data?: any;
  error?: string;
  consignmentId?: string;
  trackingNumber?: string;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
}

export interface CourierStatusResponse {
  success: boolean;
  status?: string;
  trackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  error?: string;
}

export interface CourierPriceResponse {
  success: boolean;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  error?: string;
}

export interface CourierOrder {
  id: string;
  orderId: string;
  courier: CourierType;
  consignmentId: string;
  trackingNumber: string;
  status: string;
  deliveryFee: number;
  estimatedDeliveryTime?: string;
  trackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreateCourierCredentialsRequest {
  courier: CourierType;
  credentials: any;
}

export interface UpdateCourierCredentialsRequest {
  credentials: any;
}

export interface CourierCredentialsResponse {
  success: boolean;
  data?: CourierCredentials;
  error?: string;
}

export interface CourierCredentialsListResponse {
  success: boolean;
  data?: {
    credentials: CourierCredentials[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface CourierOperationsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CourierOrderResponse {
  success: boolean;
  data?: CourierOrder;
  error?: string;
}

export interface CourierOrderListResponse {
  success: boolean;
  data?: {
    orders: CourierOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

// Form types
export interface CourierCredentialsFormData {
  courier: CourierType;
  credentials: {
    // Pathao credentials
    client_id?: string;
    client_secret?: string;
    username?: string;
    password?: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    base_url?: string;
    
    // Steadfast credentials
    api_key?: string;
    secret_key?: string;
  };
  isActive?: boolean;
}

export interface CourierOrderFormData {
  orderId: string;
  courier: CourierType;
  orderData: CourierOrderData;
}

export interface CourierPriceCalculationRequest {
  courier: CourierType;
  orderData: CourierOrderData;
}

// UI State types
export interface CourierFilters {
  search?: string;
  courier?: CourierType;
  status?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CourierPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}