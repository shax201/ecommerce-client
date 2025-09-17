import { apiSlice } from "../api/apiSlice";
import type { Api } from "@reduxjs/toolkit/query";
import {
  ClientLogoFormData,
  ClientLogoFilters,
  ReorderRequest,
} from "@/actions/content";

// ===== RESPONSE TYPES =====

export interface ClientLogoResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ClientLogosListResponse {
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

export const clientLogosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all client logos with pagination and filters
    getClientLogos: builder.query<ClientLogosListResponse, ClientLogoFilters>({
      query: ({ page = 1, limit = 10, isActive } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (isActive !== undefined) {
          params.append('isActive', isActive.toString());
        }

        return {
          url: `/content/client-logos?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ClientLogo"],
    }),

    // Get single client logo by ID
    getClientLogoById: builder.query<ClientLogoResponse, string>({
      query: (logoId) => ({
        url: `/content/client-logos/${logoId}`,
        method: "GET",
      }),
      providesTags: (result, error, logoId) => [{ type: "ClientLogo", id: logoId }],
    }),

    // Get active client logos
    getActiveClientLogos: builder.query<ClientLogosListResponse, void>({
      query: () => ({
        url: "/content/client-logos/active",
        method: "GET",
      }),
      providesTags: ["ClientLogo"],
    }),

    // Create client logo
    createClientLogo: builder.mutation<ClientLogoResponse, ClientLogoFormData>({
      query: (logoData) => ({
        url: "/content/client-logos",
        method: "POST",
        body: logoData,
      }),
      invalidatesTags: ["ClientLogo"],
    }),

    // Update client logo
    updateClientLogo: builder.mutation<ClientLogoResponse, { logoId: string; data: Partial<ClientLogoFormData> }>({
      query: ({ logoId, data }) => ({
        url: `/content/client-logos/${logoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { logoId }) => [
        { type: "ClientLogo", id: logoId },
        "ClientLogo",
      ],
    }),

    // Delete client logo
    deleteClientLogo: builder.mutation<ClientLogoResponse, string>({
      query: (logoId) => ({
        url: `/content/client-logos/${logoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, logoId) => [
        { type: "ClientLogo", id: logoId },
        "ClientLogo",
      ],
    }),

    // Reorder client logos
    reorderClientLogos: builder.mutation<ClientLogoResponse, ReorderRequest>({
      query: (updates) => ({
        url: "/content/client-logos/reorder",
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["ClientLogo"],
    }),

    // Bulk activate client logos
    bulkActivateClientLogos: builder.mutation<ClientLogoResponse, string[]>({
      queryFn: async (logoIds, { dispatch }) => {
        try {
          const promises = logoIds.map(id => 
            dispatch(clientLogosApi.endpoints.updateClientLogo.initiate({
              logoId: id,
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
                message: `Successfully activated ${successCount} client logo${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Activated ${successCount} client logo${successCount === 1 ? '' : 's'}, failed to activate ${failureCount} client logo${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["ClientLogo"],
    }),

    // Bulk deactivate client logos
    bulkDeactivateClientLogos: builder.mutation<ClientLogoResponse, string[]>({
      queryFn: async (logoIds, { dispatch }) => {
        try {
          const promises = logoIds.map(id => 
            dispatch(clientLogosApi.endpoints.updateClientLogo.initiate({
              logoId: id,
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
                message: `Successfully deactivated ${successCount} client logo${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deactivated ${successCount} client logo${successCount === 1 ? '' : 's'}, failed to deactivate ${failureCount} client logo${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["ClientLogo"],
    }),

    // Bulk delete client logos
    bulkDeleteClientLogos: builder.mutation<ClientLogoResponse, string[]>({
      queryFn: async (logoIds, { dispatch }) => {
        try {
          const promises = logoIds.map(id => 
            dispatch(clientLogosApi.endpoints.deleteClientLogo.initiate(id))
          );
          const results = await Promise.all(promises);

          const successCount = results.filter(result => result.data?.success).length;
          const failureCount = results.length - successCount;

          if (failureCount === 0) {
            return {
              data: {
                success: true,
                message: `Successfully deleted ${successCount} client logo${successCount === 1 ? '' : 's'}!`,
              },
            };
          } else {
            return {
              data: {
                success: false,
                message: `Deleted ${successCount} client logo${successCount === 1 ? '' : 's'}, failed to delete ${failureCount} client logo${failureCount === 1 ? '' : 's'}.`,
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
      invalidatesTags: ["ClientLogo"],
    }),
  }),
}) as any;

// ===== EXPORTED HOOKS =====
// Export hooks individually to avoid circular reference
export const useGetClientLogosQuery = clientLogosApi.useGetClientLogosQuery;
export const useGetClientLogoByIdQuery = clientLogosApi.useGetClientLogoByIdQuery;
export const useGetActiveClientLogosQuery = clientLogosApi.useGetActiveClientLogosQuery;
export const useCreateClientLogoMutation = clientLogosApi.useCreateClientLogoMutation;
export const useUpdateClientLogoMutation = clientLogosApi.useUpdateClientLogoMutation;
export const useDeleteClientLogoMutation = clientLogosApi.useDeleteClientLogoMutation;
export const useReorderClientLogosMutation = clientLogosApi.useReorderClientLogosMutation;
export const useBulkActivateClientLogosMutation = clientLogosApi.useBulkActivateClientLogosMutation;
export const useBulkDeactivateClientLogosMutation = clientLogosApi.useBulkDeactivateClientLogosMutation;
export const useBulkDeleteClientLogosMutation = clientLogosApi.useBulkDeleteClientLogosMutation;

// Type assertion to fix circular reference
export type ClientLogosApi = typeof clientLogosApi;
