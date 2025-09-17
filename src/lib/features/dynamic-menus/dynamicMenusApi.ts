import { apiSlice } from "../api/apiSlice";
import type { Api } from "@reduxjs/toolkit/query";
import {
  DynamicMenuFormData,
  DynamicMenuItemFormData,
  DynamicMenuFilters,
  ReorderRequest,
} from "@/actions/content";

// ===== RESPONSE TYPES =====

export interface DynamicMenuResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface DynamicMenusListResponse {
  success: boolean;
  data?: any[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}

// ===== API ENDPOINTS =====

export const dynamicMenusApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all dynamic menus with pagination and filters
    getDynamicMenus: builder.query<DynamicMenusListResponse, DynamicMenuFilters>({
      query: ({ page = 1, limit = 10, isActive } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (isActive !== undefined) {
          params.append('isActive', isActive.toString());
        }

        return {
          url: `/content/dynamic-menus?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["DynamicMenu"],
    }),

    // Get single dynamic menu by ID
    getDynamicMenuById: builder.query<DynamicMenuResponse, string>({
      query: (menuId) => ({
        url: `/content/dynamic-menus/${menuId}`,
        method: "GET",
      }),
      providesTags: (result, error, menuId) => [{ type: "DynamicMenu", id: menuId }],
    }),

    // Get dynamic menu by slug
    getDynamicMenuBySlug: builder.query<DynamicMenuResponse, string>({
      query: (slug) => ({
        url: `/content/dynamic-menus/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "DynamicMenu", id: slug }],
    }),

    // Get active dynamic menus
    getActiveDynamicMenus: builder.query<DynamicMenusListResponse, void>({
      query: () => ({
        url: "/content/dynamic-menus?isActive=true",
        method: "GET",
      }),
      providesTags: ["DynamicMenu"],
    }),

    // Create dynamic menu
    createDynamicMenu: builder.mutation<DynamicMenuResponse, DynamicMenuFormData>({
      query: (menuData) => ({
        url: "/content/dynamic-menus",
        method: "POST",
        body: menuData,
      }),
      invalidatesTags: ["DynamicMenu"],
    }),

    // Update dynamic menu
    updateDynamicMenu: builder.mutation<DynamicMenuResponse, { menuId: string; data: Partial<DynamicMenuFormData> }>({
      query: ({ menuId, data }) => ({
        url: `/content/dynamic-menus/${menuId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Delete dynamic menu
    deleteDynamicMenu: builder.mutation<DynamicMenuResponse, string>({
      query: (menuId) => ({
        url: `/content/dynamic-menus/${menuId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, menuId) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Create dynamic menu item
    createDynamicMenuItem: builder.mutation<DynamicMenuResponse, { menuId: string; data: DynamicMenuItemFormData }>({
      query: ({ menuId, data }) => ({
        url: `/content/dynamic-menus/${menuId}/items`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Update dynamic menu item
    updateDynamicMenuItem: builder.mutation<DynamicMenuResponse, { 
      menuId: string; 
      itemId: number; 
      data: Partial<DynamicMenuItemFormData> 
    }>({
      query: ({ menuId, itemId, data }) => ({
        url: `/content/dynamic-menus/${menuId}/items/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Delete dynamic menu item
    deleteDynamicMenuItem: builder.mutation<DynamicMenuResponse, { menuId: string; itemId: number }>({
      query: ({ menuId, itemId }) => ({
        url: `/content/dynamic-menus/${menuId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Reorder dynamic menu items
    reorderDynamicMenuItems: builder.mutation<DynamicMenuResponse, { 
      menuId: string; 
      updates: ReorderRequest[] 
    }>({
      query: ({ menuId, updates }) => ({
        url: `/content/dynamic-menus/${menuId}/items/reorder`,
        method: "PATCH",
        body: { updates },
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "DynamicMenu", id: menuId },
        "DynamicMenu",
      ],
    }),

    // Bulk activate dynamic menus
    bulkActivateDynamicMenus: builder.mutation<DynamicMenuResponse, string[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map(id => 
            dispatch(dynamicMenusApi.endpoints.updateDynamicMenu.initiate({
              menuId: id,
              data: { isActive: true }
            }))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully activated ${successCount} menu${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Activated ${successCount} menu${successCount === 1 ? '' : 's'}, failed to activate ${failureCount} menu${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["DynamicMenu"],
    }),

    // Bulk deactivate dynamic menus
    bulkDeactivateDynamicMenus: builder.mutation<DynamicMenuResponse, string[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map(id => 
            dispatch(dynamicMenusApi.endpoints.updateDynamicMenu.initiate({
              menuId: id,
              data: { isActive: false }
            }))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deactivated ${successCount} menu${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deactivated ${successCount} menu${successCount === 1 ? '' : 's'}, failed to deactivate ${failureCount} menu${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["DynamicMenu"],
    }),

    // Bulk delete dynamic menus
    bulkDeleteDynamicMenus: builder.mutation<DynamicMenuResponse, string[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map(id => 
            dispatch(dynamicMenusApi.endpoints.deleteDynamicMenu.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deleted ${successCount} menu${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deleted ${successCount} menu${successCount === 1 ? '' : 's'}, failed to delete ${failureCount} menu${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["DynamicMenu"],
    }),
  }),
}) as any;

// ===== EXPORTED HOOKS =====
// Export hooks individually to avoid circular reference
export const useGetDynamicMenusQuery = dynamicMenusApi.useGetDynamicMenusQuery;
export const useGetDynamicMenuByIdQuery = dynamicMenusApi.useGetDynamicMenuByIdQuery;
export const useGetDynamicMenuBySlugQuery = dynamicMenusApi.useGetDynamicMenuBySlugQuery;
export const useGetActiveDynamicMenusQuery = dynamicMenusApi.useGetActiveDynamicMenusQuery;
export const useCreateDynamicMenuMutation = dynamicMenusApi.useCreateDynamicMenuMutation;
export const useUpdateDynamicMenuMutation = dynamicMenusApi.useUpdateDynamicMenuMutation;
export const useDeleteDynamicMenuMutation = dynamicMenusApi.useDeleteDynamicMenuMutation;
export const useCreateDynamicMenuItemMutation = dynamicMenusApi.useCreateDynamicMenuItemMutation;
export const useUpdateDynamicMenuItemMutation = dynamicMenusApi.useUpdateDynamicMenuItemMutation;
export const useDeleteDynamicMenuItemMutation = dynamicMenusApi.useDeleteDynamicMenuItemMutation;
export const useReorderDynamicMenuItemsMutation = dynamicMenusApi.useReorderDynamicMenuItemsMutation;
export const useBulkActivateDynamicMenusMutation = dynamicMenusApi.useBulkActivateDynamicMenusMutation;
export const useBulkDeactivateDynamicMenusMutation = dynamicMenusApi.useBulkDeactivateDynamicMenusMutation;
export const useBulkDeleteDynamicMenusMutation = dynamicMenusApi.useBulkDeleteDynamicMenusMutation;

// Type assertion to fix circular reference
export type DynamicMenusApi = typeof dynamicMenusApi;
