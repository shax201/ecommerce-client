import { apiSlice } from '../api/apiSlice';

// Logo types
export interface LogoData {
  id: string;
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLogoData {
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}

export interface UpdateLogoData {
  name?: string;
  description?: string;
  url?: string;
  altText?: string;
  type?: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}

export interface LogosResponse {
  success: boolean;
  data: LogoData[];
  message?: string;
}

export interface LogoResponse {
  success: boolean;
  data: LogoData;
  message?: string;
}

// Logo API endpoints
export const logosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all logos
    getLogos: builder.query<LogosResponse, void>({
      query: () => '/content/logos',
      providesTags: ['Logo'],
      transformResponse: (response: any) => {
        // Transform the response to match our expected format
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data.map((logo: any) => ({
              id: logo._id || logo.id,
              name: logo.name,
              description: logo.description,
              url: logo.url,
              altText: logo.altText,
              type: logo.type,
              isActive: logo.isActive,
              createdAt: logo.createdAt,
              updatedAt: logo.updatedAt
            })),
            message: response.message
          };
        }
        return { success: false, data: [], message: 'Failed to fetch logos' };
      },
    }),

    // Get active logos by type
    getActiveLogosByType: builder.query<LogosResponse, string>({
      query: (type) => `/content/logos/active/${type}`,
      providesTags: ['Logo'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data.map((logo: any) => ({
              id: logo._id || logo.id,
              name: logo.name,
              description: logo.description,
              url: logo.url,
              altText: logo.altText,
              type: logo.type,
              isActive: logo.isActive,
              createdAt: logo.createdAt,
              updatedAt: logo.updatedAt
            })),
            message: response.message
          };
        }
        return { success: false, data: [], message: 'Failed to fetch logos by type' };
      },
    }),

    // Get single logo by ID
    getLogoById: builder.query<LogoResponse, string>({
      query: (id) => `/content/logos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Logo', id }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              id: response.data._id || response.data.id,
              name: response.data.name,
              description: response.data.description,
              url: response.data.url,
              altText: response.data.altText,
              type: response.data.type,
              isActive: response.data.isActive,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as LogoData, message: 'Failed to fetch logo' };
      },
    }),

    // Create new logo
    createLogo: builder.mutation<LogoResponse, CreateLogoData>({
      query: (logoData) => ({
        url: '/content/logos',
        method: 'POST',
        body: logoData,
      }),
      invalidatesTags: ['Logo'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              id: response.data._id || response.data.id,
              name: response.data.name,
              description: response.data.description,
              url: response.data.url,
              altText: response.data.altText,
              type: response.data.type,
              isActive: response.data.isActive,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as LogoData, message: 'Failed to create logo' };
      },
    }),

    // Update logo
    updateLogo: builder.mutation<LogoResponse, { id: string; data: UpdateLogoData }>({
      query: ({ id, data }) => ({
        url: `/content/logos/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Logo', id }, 'Logo'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              id: response.data._id || response.data.id,
              name: response.data.name,
              description: response.data.description,
              url: response.data.url,
              altText: response.data.altText,
              type: response.data.type,
              isActive: response.data.isActive,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as LogoData, message: 'Failed to update logo' };
      },
    }),

    // Delete logo
    deleteLogo: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/content/logos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Logo', id }, 'Logo'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Logo deleted successfully'
        };
      },
    }),

    // Toggle logo active status
    toggleLogoStatus: builder.mutation<LogoResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/content/logos/${id}`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Logo', id }, 'Logo'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              id: response.data._id || response.data.id,
              name: response.data.name,
              description: response.data.description,
              url: response.data.url,
              altText: response.data.altText,
              type: response.data.type,
              isActive: response.data.isActive,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as LogoData, message: 'Failed to update logo status' };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetLogosQuery,
  useGetActiveLogosByTypeQuery,
  useGetLogoByIdQuery,
  useCreateLogoMutation,
  useUpdateLogoMutation,
  useDeleteLogoMutation,
  useToggleLogoStatusMutation,
} = logosApi;

// Export the API slice
export default logosApi;
