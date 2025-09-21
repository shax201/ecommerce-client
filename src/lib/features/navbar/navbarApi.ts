import { apiSlice } from "../api/apiSlice";
import {
  NavbarFormData,
  NavbarMenuFormData,
  NavbarMenuItemFormData,
  ReorderRequest,
  ContentResponse,
} from "@/actions/content";

// ===== RESPONSE TYPES =====

export interface NavbarResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface NavbarMenuResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// ===== API ENDPOINTS =====

export const navbarApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get navbar data
    getNavbar: builder.query<NavbarResponse, void>({
      query: () => ({
        url: "/content/navbar",
        method: "GET",
      }),
      providesTags: ["Navbar"],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Navbar data fetched successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to fetch navbar data",
        };
      },
    }),

    // Update navbar
    updateNavbar: builder.mutation<NavbarResponse, NavbarFormData>({
      query: (navbarData) => ({
        url: "/content/navbar",
        method: "PUT",
        body: navbarData,
      }),
      invalidatesTags: ["Navbar"],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Navbar updated successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to update navbar",
        };
      },
    }),

    // Add navbar menu
    addNavbarMenu: builder.mutation<NavbarMenuResponse, NavbarMenuFormData>({
      query: (menuData) => ({
        url: "/content/navbar/menus",
        method: "POST",
        body: menuData,
      }),
      invalidatesTags: ["Navbar"],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu added successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to add menu",
        };
      },
    }),

    // Update navbar menu
    updateNavbarMenu: builder.mutation<
      NavbarMenuResponse,
      { menuId: number; data: Partial<NavbarMenuFormData> }
    >({
      query: ({ menuId, data }) => ({
        url: `/content/navbar/menus/${menuId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu updated successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to update menu",
        };
      },
    }),

    // Delete navbar menu
    deleteNavbarMenu: builder.mutation<NavbarMenuResponse, number>({
      query: (menuId) => ({
        url: `/content/navbar/menus/${menuId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, menuId) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu deleted successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to delete menu",
        };
      },
    }),

    // Add navbar menu item
    addNavbarMenuItem: builder.mutation<
      NavbarMenuResponse,
      { menuId: number; data: NavbarMenuItemFormData }
    >({
      query: ({ menuId, data }) => ({
        url: `/content/navbar/menus/${menuId}/items`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu item added successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to add menu item",
        };
      },
    }),

    // Update navbar menu item
    updateNavbarMenuItem: builder.mutation<
      NavbarMenuResponse,
      { menuId: number; itemId: number; data: Partial<NavbarMenuItemFormData> }
    >({
      query: ({ menuId, itemId, data }) => ({
        url: `/content/navbar/menus/${menuId}/items/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu item updated successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to update menu item",
        };
      },
    }),

    // Delete navbar menu item
    deleteNavbarMenuItem: builder.mutation<
      NavbarMenuResponse,
      { menuId: number; itemId: number }
    >({
      query: ({ menuId, itemId }) => ({
        url: `/content/navbar/menus/${menuId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu item deleted successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to delete menu item",
        };
      },
    }),

    // Reorder navbar menus
    reorderNavbarMenus: builder.mutation<NavbarResponse, ReorderRequest[]>({
      query: (updates) => ({
        url: "/content/navbar/menus/reorder",
        method: "PUT",
        body: { updates },
      }),
      invalidatesTags: ["Navbar"],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menus reordered successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to reorder menus",
        };
      },
    }),

    // Reorder navbar menu items
    reorderNavbarMenuItems: builder.mutation<
      NavbarResponse,
      { menuId: number; updates: ReorderRequest[] }
    >({
      query: ({ menuId, updates }) => ({
        url: `/content/navbar/menus/${menuId}/items/reorder`,
        method: "PUT",
        body: { updates },
      }),
      invalidatesTags: (result, error, { menuId }) => [
        { type: "Navbar", id: menuId },
        "Navbar",
      ],
      transformResponse: (response: any) => {
        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Menu items reordered successfully",
          };
        }
        return {
          success: false,
          data: null,
          message: response.message || "Failed to reorder menu items",
        };
      },
    }),

    // Bulk operations
    bulkActivateNavbarMenus: builder.mutation<NavbarResponse, number[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map((id) =>
            dispatch(
              navbarApi.endpoints.updateNavbarMenu.initiate({
                menuId: id,
                data: { isActive: true },
              })
            )
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(
            (result) => result.data?.success
          ).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully activated ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Activated ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }, failed to activate ${failureCount} menu${
                  failureCount === 1 ? "" : "s"
                }.`,
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
      invalidatesTags: ["Navbar"],
    }),

    bulkDeactivateNavbarMenus: builder.mutation<NavbarResponse, number[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map((id) =>
            dispatch(
              navbarApi.endpoints.updateNavbarMenu.initiate({
                menuId: id,
                data: { isActive: false },
              })
            )
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(
            (result) => result.data?.success
          ).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deactivated ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deactivated ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }, failed to deactivate ${failureCount} menu${
                  failureCount === 1 ? "" : "s"
                }.`,
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
      invalidatesTags: ["Navbar"],
    }),

    bulkDeleteNavbarMenus: builder.mutation<NavbarResponse, number[]>({
      queryFn: async (menuIds, { dispatch }) => {
        try {
          const promises = menuIds.map((id) =>
            dispatch(navbarApi.endpoints.deleteNavbarMenu.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(
            (result) => result.data?.success
          ).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deleted ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deleted ${successCount} menu${
                  successCount === 1 ? "" : "s"
                }, failed to delete ${failureCount} menu${
                  failureCount === 1 ? "" : "s"
                }.`,
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
      invalidatesTags: ["Navbar"],
    }),
  }),
}) as any;

// ===== EXPORTED HOOKS =====
export const {
  useGetNavbarQuery,
  useUpdateNavbarMutation,
  useAddNavbarMenuMutation,
  useUpdateNavbarMenuMutation,
  useDeleteNavbarMenuMutation,
  useAddNavbarMenuItemMutation,
  useUpdateNavbarMenuItemMutation,
  useDeleteNavbarMenuItemMutation,
  useReorderNavbarMenusMutation,
  useReorderNavbarMenuItemsMutation,
  useBulkActivateNavbarMenusMutation,
  useBulkDeactivateNavbarMenusMutation,
  useBulkDeleteNavbarMenusMutation,
} = navbarApi;

// Type assertion to fix circular reference
export type NavbarApi = typeof navbarApi;
