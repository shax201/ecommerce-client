import { CouponCreateData, CouponUpdateData } from "@/types/coupon.types";

/**
 * Converts Date objects to ISO strings for API requests
 */
export function prepareCouponDataForApi<T extends CouponCreateData | CouponUpdateData>(
  data: T
): T {
  return {
    ...data,
    validFrom: data.validFrom ? (data.validFrom instanceof Date ? data.validFrom.toISOString() : data.validFrom) : undefined,
    validTo: data.validTo ? (data.validTo instanceof Date ? data.validTo.toISOString() : data.validTo) : undefined,
  };
}

/**
 * Converts ISO strings from API to Date objects for form handling
 */
export function prepareCouponDataFromApi(coupon: any) {
  return {
    ...coupon,
    validFrom: coupon.validFrom ? new Date(coupon.validFrom) : undefined,
    validTo: coupon.validTo ? new Date(coupon.validTo) : undefined,
    createdAt: coupon.createdAt ? new Date(coupon.createdAt) : undefined,
    updatedAt: coupon.updatedAt ? new Date(coupon.updatedAt) : undefined,
  };
}
