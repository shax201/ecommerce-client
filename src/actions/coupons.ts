"use server";

import { revalidateTag } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";
import {
  Coupon,
  CouponCreateData,
  CouponUpdateData,
  CouponValidationRequest,
  CouponValidationResponse,
  CouponApplyRequest,
  CouponApplyResponse,
  CouponListResponse,
} from "@/types/coupon.types";

export interface CouponResponse {
  success: boolean;
  message: string;
  data?: Coupon;
  error?: string;
}

export interface CouponsListResponse {
  success: boolean;
  data?: CouponListResponse;
  error?: string;
}

// ===== COUPON CRUD OPERATIONS =====

export async function createCoupon(
  formData: CouponCreateData
): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Revalidate coupon cache
      revalidateTag(ISR_TAGS.COUPONS);

      return {
        success: true,
        message: "Coupon created successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to create coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error creating coupon:", error);
    return {
      success: false,
      message: "An error occurred while creating the coupon.",
      error: "Network error",
    };
  }
}

export async function updateCoupon(
  couponId: string,
  formData: CouponUpdateData
): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/${couponId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Revalidate coupon cache
      revalidateTag(ISR_TAGS.COUPONS);
      revalidateTag(`coupon-${couponId}`);

      return {
        success: true,
        message: "Coupon updated successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to update coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error updating coupon:", error);
    return {
      success: false,
      message: "An error occurred while updating the coupon.",
      error: "Network error",
    };
  }
}

export async function getCoupon(couponId: string): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/${couponId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { tags: [ISR_TAGS.COUPONS, `coupon-${couponId}`] },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: "Coupon retrieved successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to retrieve coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error retrieving coupon:", error);
    return {
      success: false,
      message: "An error occurred while retrieving the coupon.",
      error: "Network error",
    };
  }
}

export async function getCoupons(
  page: number = 1,
  limit: number = 10,
  search?: string,
  isActive?: boolean
): Promise<CouponsListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/coupons?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { tags: [ISR_TAGS.COUPONS] },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.error || "Failed to retrieve coupons.",
      };
    }
  } catch (error) {
    console.error("Error retrieving coupons:", error);
    return {
      success: false,
      error: "Network error",
    };
  }
}

export async function deleteCoupon(couponId: string): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/${couponId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Revalidate coupon cache
      revalidateTag(ISR_TAGS.COUPONS);
      revalidateTag(`coupon-${couponId}`);

      return {
        success: true,
        message: "Coupon deleted successfully!",
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message: data.error || "Failed to delete coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return {
      success: false,
      message: "An error occurred while deleting the coupon.",
      error: "Network error",
    };
  }
}

export async function activateCoupon(couponId: string): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/${couponId}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Revalidate coupon cache
      revalidateTag(ISR_TAGS.COUPONS);
      revalidateTag(`coupon-${couponId}`);

      return {
        success: true,
        message: "Coupon activated successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to activate coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error activating coupon:", error);
    return {
      success: false,
      message: "An error occurred while activating the coupon.",
      error: "Network error",
    };
  }
}

export async function deactivateCoupon(couponId: string): Promise<CouponResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/${couponId}/deactivate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Revalidate coupon cache
      revalidateTag(ISR_TAGS.COUPONS);
      revalidateTag(`coupon-${couponId}`);

      return {
        success: true,
        message: "Coupon deactivated successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to deactivate coupon.",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error deactivating coupon:", error);
    return {
      success: false,
      message: "An error occurred while deactivating the coupon.",
      error: "Network error",
    };
  }
}

// ===== COUPON VALIDATION AND APPLICATION =====

export async function validateCoupon(
  validationData: CouponValidationRequest
): Promise<CouponValidationResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data.data;
    } else {
      return {
        isValid: false,
        error: data.error || "Failed to validate coupon.",
      };
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      isValid: false,
      error: "Network error occurred while validating coupon.",
    };
  }
}

export async function applyCoupon(
  applyData: CouponApplyRequest
): Promise<CouponApplyResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applyData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data.data;
    } else {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: applyData.orderValue,
        error: data.error || "Failed to apply coupon.",
      };
    }
  } catch (error) {
    console.error("Error applying coupon:", error);
    return {
      isValid: false,
      discountAmount: 0,
      finalAmount: applyData.orderValue,
      error: "Network error occurred while applying coupon.",
    };
  }
}

// ===== COUPON UTILITY FUNCTIONS =====

export async function getActiveCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/coupons/active/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { tags: [ISR_TAGS.COUPONS] },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data.data || [];
    } else {
      console.error("Failed to fetch active coupons:", data.error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return [];
  }
}

// ===== BULK OPERATIONS =====

export async function bulkActivateCoupons(couponIds: string[]): Promise<CouponResponse> {
  try {
    const promises = couponIds.map(id => activateCoupon(id));
    const results = await Promise.all(promises);

    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;

    if (failureCount === 0) {
      return {
        success: true,
        message: `Successfully activated ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
      };
    } else {
      return {
        success: false,
        message: `Activated ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to activate ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
      };
    }
  } catch (error) {
    console.error("Error in bulk activate:", error);
    return {
      success: false,
      message: "An error occurred during bulk activation.",
      error: "Bulk operation error",
    };
  }
}

export async function bulkDeactivateCoupons(couponIds: string[]): Promise<CouponResponse> {
  try {
    const promises = couponIds.map(id => deactivateCoupon(id));
    const results = await Promise.all(promises);

    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;

    if (failureCount === 0) {
      return {
        success: true,
        message: `Successfully deactivated ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
      };
    } else {
      return {
        success: false,
        message: `Deactivated ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to deactivate ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
      };
    }
  } catch (error) {
    console.error("Error in bulk deactivate:", error);
    return {
      success: false,
      message: "An error occurred during bulk deactivation.",
      error: "Bulk operation error",
    };
  }
}

export async function bulkDeleteCoupons(couponIds: string[]): Promise<CouponResponse> {
  try {
    const promises = couponIds.map(id => deleteCoupon(id));
    const results = await Promise.all(promises);

    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;

    if (failureCount === 0) {
      return {
        success: true,
        message: `Successfully deleted ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
      };
    } else {
      return {
        success: false,
        message: `Deleted ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to delete ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
      };
    }
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return {
      success: false,
      message: "An error occurred during bulk deletion.",
      error: "Bulk operation error",
    };
  }
}

