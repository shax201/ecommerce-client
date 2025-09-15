import { apiSlice } from "../api/apiSlice";

// Types
export interface ColorData {
  _id: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ColorPayload {
  color?: string;
  colors?: string[];
}

export interface ColorResponse {
  success: boolean;
  message: string;
  data?: ColorData[];
}

export const colorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all colors
    getColors: builder.query<ColorResponse, void>({
      query: () => "/attributes/colors",
      providesTags: ["Color"],
    }),

    // Get single color by ID
    getSingleColor: builder.query<ColorResponse, string>({
      query: (id) => `/attributes/colors/${id}`,
      providesTags: (result, error, id) => [{ type: "Color", id }],
    }),

    // Create color(s)
    createColor: builder.mutation<ColorResponse, ColorPayload>({
      query: (payload) => ({
        url: "/attributes/colors/create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Color"],
    }),

    // Update color
    updateColor: builder.mutation<ColorResponse, { id: string; payload: { color: string } }>({
      query: ({ id, payload }) => ({
        url: `/attributes/colors/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Color", id },
        "Color",
      ],
    }),

    // Delete color
    deleteColor: builder.mutation<ColorResponse, string>({
      query: (id) => ({
        url: `/attributes/colors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Color", id },
        "Color",
      ],
    }),
  }),
});

export const {
  useGetColorsQuery,
  useGetSingleColorQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorsApi;
