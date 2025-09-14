export interface CouponUsage {
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscountAmount?: number;
  usageLimit: number;
  usageCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  userRestrictions?: {
    firstTimeUsersOnly?: boolean;
    specificUsers?: string[];
    excludeUsers?: string[];
  };
  usageHistory: CouponUsage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponCreateData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string; // ISO string for API
  validTo: string; // ISO string for API
  applicableCategories?: string[];
  applicableProducts?: string[];
  userRestrictions?: {
    firstTimeUsersOnly?: boolean;
    specificUsers?: string[];
    excludeUsers?: string[];
  };
}

export interface CouponUpdateData {
  description?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string; // ISO string for API
  validTo?: string; // ISO string for API
  isActive?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  userRestrictions?: {
    firstTimeUsersOnly?: boolean;
    specificUsers?: string[];
    excludeUsers?: string[];
  };
}

export interface CouponValidationRequest {
  code: string;
  orderValue: number;
  userId?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export interface CouponValidationResponse {
  isValid: boolean;
  coupon?: {
    code: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrderValue: number;
    maximumDiscountAmount?: number;
  };
  error?: string;
}

export interface CouponApplyRequest {
  code: string;
  orderValue: number;
  userId?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export interface CouponApplyResponse {
  isValid: boolean;
  coupon?: {
    code: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrderValue: number;
    maximumDiscountAmount?: number;
  };
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

export interface CouponListResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CouponFormData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscountAmount?: number;
  usageLimit: number;
  validFrom: Date;
  validTo: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  userRestrictions?: {
    firstTimeUsersOnly?: boolean;
    specificUsers?: string[];
    excludeUsers?: string[];
  };
}

