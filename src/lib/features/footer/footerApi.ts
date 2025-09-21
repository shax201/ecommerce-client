import { apiSlice } from "../api/apiSlice";
import type {
  FooterFormData,
  ContactInfoFormData,
  FooterSectionFormData,
  FooterLinkFormData,
} from "./footerSlice";

// ===== TYPES =====

export interface FooterResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    sections: Array<{
      _id: string;
      title: string;
      links: Array<{
        _id: string;
        title: string;
        url: string;
        isExternal: boolean;
        isActive: boolean;
        order: number;
      }>;
      isActive: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
      socialMedia: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        github?: string;
      };
    };
    copyright: string;
    description: string;
    logoUrl: string;
    logoAlt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ContentResponse {
  success: boolean;
  message: string;
  data: any;
}

// ===== API ENDPOINTS =====

export const footerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ===== FOOTER CRUD =====
    
    // Get footer data
    getFooter: builder.query<FooterResponse, void>({
      query: () => ({
        url: '/content/footer',
        method: 'GET',
      }),
      providesTags: ['Footer'],
      transformResponse: (response: any) => {
        // Transform the response to match our expected format
        if (response.success && response.data) {
          return {
            success: true,
            message: response.message || 'Footer data fetched successfully',
            data: {
              _id: response.data._id,
              sections: response.data.sections?.map((section: any) => ({
                _id: section._id,
                title: section.title,
                links: section.links?.map((link: any) => ({
                  _id: link._id,
                  title: link.title,
                  url: link.url,
                  isExternal: link.isExternal,
                  isActive: link.isActive,
                  order: link.order,
                })) || [],
                isActive: section.isActive,
                order: section.order,
                createdAt: section.createdAt,
                updatedAt: section.updatedAt,
              })) || [],
              contactInfo: response.data.contactInfo || {
                email: '',
                phone: '',
                address: '',
                socialMedia: {},
              },
              copyright: response.data.copyright || '',
              description: response.data.description || '',
              logoUrl: response.data.logoUrl || '',
              logoAlt: response.data.logoAlt || '',
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
            },
          };
        }
        return response;
      },
    }),
    
    // Update footer general information
    updateFooter: builder.mutation<ContentResponse, FooterFormData>({
      query: (data) => ({
        url: '/content/footer',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // Update contact information
    updateContactInfo: builder.mutation<ContentResponse, ContactInfoFormData>({
      query: (data) => ({
        url: '/content/footer/contact',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // ===== FOOTER SECTIONS =====
    
    // Add footer section
    addFooterSection: builder.mutation<ContentResponse, FooterSectionFormData>({
      query: (data) => ({
        url: '/content/footer/sections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // Update footer section
    updateFooterSection: builder.mutation<ContentResponse, { sectionId: string; data: Partial<FooterSectionFormData> }>({
      query: ({ sectionId, data }) => ({
        url: `/content/footer/sections/${sectionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // Delete footer section
    deleteFooterSection: builder.mutation<ContentResponse, string>({
      query: (sectionId) => ({
        url: `/content/footer/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // ===== FOOTER LINKS =====
    
    // Add footer link
    addFooterLink: builder.mutation<ContentResponse, { sectionId: string; data: FooterLinkFormData }>({
      query: ({ sectionId, data }) => ({
        url: `/content/footer/sections/${sectionId}/links`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // Update footer link
    updateFooterLink: builder.mutation<ContentResponse, { sectionId: string; linkId: string; data: Partial<FooterLinkFormData> }>({
      query: ({ sectionId, linkId, data }) => ({
        url: `/content/footer/sections/${sectionId}/links/${linkId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Footer'],
    }),
    
    // Delete footer link
    deleteFooterLink: builder.mutation<ContentResponse, { sectionId: string; linkId: string }>({
      query: ({ sectionId, linkId }) => ({
        url: `/content/footer/sections/${sectionId}/links/${linkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Footer'],
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useGetFooterQuery,
  useUpdateFooterMutation,
  useUpdateContactInfoMutation,
  useAddFooterSectionMutation,
  useUpdateFooterSectionMutation,
  useDeleteFooterSectionMutation,
  useAddFooterLinkMutation,
  useUpdateFooterLinkMutation,
  useDeleteFooterLinkMutation,
} = footerApi;

// ===== SELECTORS =====

export const selectFooterData = (state: any) => state.footer.footer;
export const selectFooterLoading = (state: any) => state.footer.loading;
export const selectFooterError = (state: any) => state.footer.error;
export const selectFooterUpdating = (state: any) => state.footer.updating;
export const selectFooterDeleting = (state: any) => state.footer.deleting;
