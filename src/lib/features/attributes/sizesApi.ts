import { apiSlice } from "../api/apiSlice";

// Types
export interface SizeData {
  _id: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SizePayload {
  size?: string;
  sizes?: string[];
}

export interface SizeResponse {
  success: boolean;
  message: string;
  data?: SizeData[];
}

export const sizesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sizes
    getSizes: builder.query<SizeResponse, void>({
      query: () => "/attributes/sizes",
      providesTags: ["Size"],
    }),

    // Get single size by ID
    getSingleSize: builder.query<SizeResponse, string>({
      query: (id) => `/attributes/sizes/${id}`,
      providesTags: (result, error, id) => [{ type: "Size", id }],
    }),

    // Create size(s)
    createSize: builder.mutation<SizeResponse, SizePayload>({
      query: (payload) => ({
        url: "/attributes/sizes/create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Size"],
    }),

    // Update size
    updateSize: builder.mutation<SizeResponse, { id: string; payload: { size: string } }>({
      query: ({ id, payload }) => ({
        url: `/attributes/sizes/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Size", id },
        "Size",
      ],
    }),

    // Delete size
    deleteSize: builder.mutation<SizeResponse, string>({
      query: (id) => ({
        url: `/attributes/sizes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Size", id },
        "Size",
      ],
    }),
  }),
});

export const {
  useGetSizesQuery,
  useGetSingleSizeQuery,
  useCreateSizeMutation,
  useUpdateSizeMutation,
  useDeleteSizeMutation,
} = sizesApi;
