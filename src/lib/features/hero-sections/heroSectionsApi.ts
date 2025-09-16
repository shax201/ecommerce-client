import { apiSlice } from '../api/apiSlice';

// Hero Section types
export interface HeroSectionData {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHeroSectionData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateHeroSectionData {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive?: boolean;
  order?: number;
}

export interface ReorderHeroSectionsData {
  updates: { id: string; order: number }[];
}

export interface HeroSectionsResponse {
  success: boolean;
  data: HeroSectionData[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HeroSectionResponse {
  success: boolean;
  data: HeroSectionData;
  message?: string;
}

export interface ReorderResponse {
  success: boolean;
  message?: string;
}

// Hero Sections API endpoints
export const heroSectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all hero sections
    getHeroSections: builder.query<HeroSectionsResponse, { page?: number; limit?: number } | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        const queryString = searchParams.toString();
        return `/content/hero-sections${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['HeroSection'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data.map((hero: any) => ({
              _id: hero._id || hero.id,
              title: hero.title,
              subtitle: hero.subtitle,
              description: hero.description,
              primaryButtonText: hero.primaryButtonText,
              primaryButtonLink: hero.primaryButtonLink,
              secondaryButtonText: hero.secondaryButtonText,
              secondaryButtonLink: hero.secondaryButtonLink,
              backgroundImage: hero.backgroundImage,
              backgroundImageAlt: hero.backgroundImageAlt,
              isActive: hero.isActive,
              order: hero.order,
              createdAt: hero.createdAt,
              updatedAt: hero.updatedAt
            })),
            message: response.message,
            pagination: response.pagination
          };
        }
        return { success: false, data: [], message: 'Failed to fetch hero sections' };
      },
    }),

    // Get single hero section by ID
    getHeroSectionById: builder.query<HeroSectionResponse, string>({
      query: (id) => `/content/hero-sections/${id}`,
      providesTags: (result, error, id) => [{ type: 'HeroSection', id }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id || response.data.id,
              title: response.data.title,
              subtitle: response.data.subtitle,
              description: response.data.description,
              primaryButtonText: response.data.primaryButtonText,
              primaryButtonLink: response.data.primaryButtonLink,
              secondaryButtonText: response.data.secondaryButtonText,
              secondaryButtonLink: response.data.secondaryButtonLink,
              backgroundImage: response.data.backgroundImage,
              backgroundImageAlt: response.data.backgroundImageAlt,
              isActive: response.data.isActive,
              order: response.data.order,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as HeroSectionData, message: 'Failed to fetch hero section' };
      },
    }),

    // Create new hero section
    createHeroSection: builder.mutation<HeroSectionResponse, CreateHeroSectionData>({
      query: (heroData) => ({
        url: '/content/hero-sections',
        method: 'POST',
        body: heroData,
      }),
      invalidatesTags: ['HeroSection'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id || response.data.id,
              title: response.data.title,
              subtitle: response.data.subtitle,
              description: response.data.description,
              primaryButtonText: response.data.primaryButtonText,
              primaryButtonLink: response.data.primaryButtonLink,
              secondaryButtonText: response.data.secondaryButtonText,
              secondaryButtonLink: response.data.secondaryButtonLink,
              backgroundImage: response.data.backgroundImage,
              backgroundImageAlt: response.data.backgroundImageAlt,
              isActive: response.data.isActive,
              order: response.data.order,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as HeroSectionData, message: 'Failed to create hero section' };
      },
    }),

    // Update hero section
    updateHeroSection: builder.mutation<HeroSectionResponse, { id: string; data: UpdateHeroSectionData }>({
      query: ({ id, data }) => ({
        url: `/content/hero-sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HeroSection', id }, 'HeroSection'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id || response.data.id,
              title: response.data.title,
              subtitle: response.data.subtitle,
              description: response.data.description,
              primaryButtonText: response.data.primaryButtonText,
              primaryButtonLink: response.data.primaryButtonLink,
              secondaryButtonText: response.data.secondaryButtonText,
              secondaryButtonLink: response.data.secondaryButtonLink,
              backgroundImage: response.data.backgroundImage,
              backgroundImageAlt: response.data.backgroundImageAlt,
              isActive: response.data.isActive,
              order: response.data.order,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as HeroSectionData, message: 'Failed to update hero section' };
      },
    }),

    // Delete hero section
    deleteHeroSection: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/content/hero-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'HeroSection', id }, 'HeroSection'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Hero section deleted successfully'
        };
      },
    }),

    // Toggle hero section active status
    toggleHeroSectionStatus: builder.mutation<HeroSectionResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/content/hero-sections/${id}`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HeroSection', id }, 'HeroSection'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id || response.data.id,
              title: response.data.title,
              subtitle: response.data.subtitle,
              description: response.data.description,
              primaryButtonText: response.data.primaryButtonText,
              primaryButtonLink: response.data.primaryButtonLink,
              secondaryButtonText: response.data.secondaryButtonText,
              secondaryButtonLink: response.data.secondaryButtonLink,
              backgroundImage: response.data.backgroundImage,
              backgroundImageAlt: response.data.backgroundImageAlt,
              isActive: response.data.isActive,
              order: response.data.order,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt
            },
            message: response.message
          };
        }
        return { success: false, data: {} as HeroSectionData, message: 'Failed to update hero section status' };
      },
    }),

    // Reorder hero sections
    reorderHeroSections: builder.mutation<ReorderResponse, ReorderHeroSectionsData>({
      query: (data) => ({
        url: '/content/hero-sections/reorder',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['HeroSection'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Hero sections reordered successfully'
        };
      },
    }),

    // Bulk delete hero sections
    bulkDeleteHeroSections: builder.mutation<{ success: boolean; message?: string }, string[]>({
      query: (ids) => ({
        url: '/content/hero-sections/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['HeroSection'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Hero sections deleted successfully'
        };
      },
    }),

    // Bulk update hero sections
    bulkUpdateHeroSections: builder.mutation<{ success: boolean; message?: string }, { ids: string[]; data: UpdateHeroSectionData }>({
      query: ({ ids, data }) => ({
        url: '/content/hero-sections/bulk-update',
        method: 'PUT',
        body: { ids, data },
      }),
      invalidatesTags: ['HeroSection'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Hero sections updated successfully'
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetHeroSectionsQuery,
  useGetHeroSectionByIdQuery,
  useCreateHeroSectionMutation,
  useUpdateHeroSectionMutation,
  useDeleteHeroSectionMutation,
  useToggleHeroSectionStatusMutation,
  useReorderHeroSectionsMutation,
  useBulkDeleteHeroSectionsMutation,
  useBulkUpdateHeroSectionsMutation,
} = heroSectionsApi;

// Export the API slice
export default heroSectionsApi;
