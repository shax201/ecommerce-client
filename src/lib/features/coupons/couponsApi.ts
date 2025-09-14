import { apiSlice } from "../api/apiSlice";
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
import { prepareCouponDataForApi } from "@/lib/utils/coupon-utils";

// ===== RESPONSE TYPES =====

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

// ===== API ENDPOINTS =====

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all coupons with pagination and filters
    getCoupons: builder.query<CouponsListResponse, {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }>({
      query: ({ page = 1, limit = 10, search, isActive } = {}) => {
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

        return {
          url: `/coupons?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Coupon"],
    }),

    // Get single coupon by ID
    getCouponById: builder.query<CouponResponse, string>({
      query: (couponId) => ({
        url: `/coupons/${couponId}`,
        method: "GET",
      }),
      providesTags: (result, error, couponId) => [{ type: "Coupon", id: couponId }],
    }),

    // Get active coupons list
    getActiveCoupons: builder.query<Coupon[], void>({
      query: () => ({
        url: "/coupons/active/list",
        method: "GET",
      }),
      providesTags: ["Coupon"],
    }),

    // Create coupon
    createCoupon: builder.mutation<CouponResponse, CouponCreateData>({
      query: (couponData) => ({
        url: "/coupons",
        method: "POST",
        body: prepareCouponDataForApi(couponData),
      }),
      invalidatesTags: ["Coupon"],
    }),

    // Update coupon
    updateCoupon: builder.mutation<CouponResponse, { couponId: string; data: CouponUpdateData }>({
      query: ({ couponId, data }) => ({
        url: `/coupons/${couponId}`,
        method: "PUT",
        body: prepareCouponDataForApi(data),
      }),
      invalidatesTags: (result, error, { couponId }) => [
        { type: "Coupon", id: couponId },
        "Coupon",
      ],
    }),

    // Delete coupon
    deleteCoupon: builder.mutation<CouponResponse, string>({
      query: (couponId) => ({
        url: `/coupons/${couponId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, couponId) => [
        { type: "Coupon", id: couponId },
        "Coupon",
      ],
    }),

    // Activate coupon
    activateCoupon: builder.mutation<CouponResponse, string>({
      query: (couponId) => ({
        url: `/coupons/${couponId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, couponId) => [
        { type: "Coupon", id: couponId },
        "Coupon",
      ],
    }),

    // Deactivate coupon
    deactivateCoupon: builder.mutation<CouponResponse, string>({
      query: (couponId) => ({
        url: `/coupons/${couponId}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, couponId) => [
        { type: "Coupon", id: couponId },
        "Coupon",
      ],
    }),

    // Validate coupon
    validateCoupon: builder.mutation<CouponValidationResponse, CouponValidationRequest>({
      query: (validationData) => ({
        url: "/coupons/validate",
        method: "POST",
        body: validationData,
      }),
    }),

    // Apply coupon
    applyCoupon: builder.mutation<CouponApplyResponse, CouponApplyRequest>({
      query: (applyData) => ({
        url: "/coupons/apply",
        method: "POST",
        body: applyData,
      }),
    }),

    // Bulk activate coupons
    bulkActivateCoupons: builder.mutation<CouponResponse, string[]>({
      queryFn: async (couponIds, { dispatch }) => {
        try {
          const promises = couponIds.map(id => 
            dispatch(couponsApi.endpoints.activateCoupon.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully activated ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Activated ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to activate ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
              },
            };
          }
        } catch (error) {
          return {
            error: {
              status: 500,
              data: "An error occurred during bulk activation.",
            },
          };
        }
      },
      invalidatesTags: ["Coupon"],
    }),

    // Bulk deactivate coupons
    bulkDeactivateCoupons: builder.mutation<CouponResponse, string[]>({
      queryFn: async (couponIds, { dispatch }) => {
        try {
          const promises = couponIds.map(id => 
            dispatch(couponsApi.endpoints.deactivateCoupon.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deactivated ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deactivated ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to deactivate ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
              },
            };
          }
        } catch (error) {
          return {
            error: {
              status: 500,
              data: "An error occurred during bulk deactivation.",
            },
          };
        }
      },
      invalidatesTags: ["Coupon"],
    }),

    // Bulk delete coupons
    bulkDeleteCoupons: builder.mutation<CouponResponse, string[]>({
      queryFn: async (couponIds, { dispatch }) => {
        try {
          const promises = couponIds.map(id => 
            dispatch(couponsApi.endpoints.deleteCoupon.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deleted ${successCount} coupon${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deleted ${successCount} coupon${successCount === 1 ? '' : 's'}, failed to delete ${failureCount} coupon${failureCount === 1 ? '' : 's'}.`,
              },
            };
          }
        } catch (error) {
          return {
            error: {
              status: 500,
              data: "An error occurred during bulk deletion.",
            },
          };
        }
      },
      invalidatesTags: ["Coupon"],
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useGetActiveCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useActivateCouponMutation,
  useDeactivateCouponMutation,
  useValidateCouponMutation,
  useApplyCouponMutation,
  useBulkActivateCouponsMutation,
  useBulkDeactivateCouponsMutation,
  useBulkDeleteCouponsMutation,
} = couponsApi;
