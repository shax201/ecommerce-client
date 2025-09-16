import { apiSlice } from "../api/apiSlice";

// ===== TYPES =====

export interface ShippingAddress {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: number; // Changed to number to match backend
  isDefault: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingAddressData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: number; // Changed to number to match backend
  isDefault?: boolean;
  user: string; // Add user field
}

export interface UpdateShippingAddressData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: number; // Changed to number to match backend
  isDefault?: boolean;
}

export interface ShippingAddressResponse {
  success: boolean;
  message: string;
  data: ShippingAddress[];
}

export interface SingleShippingAddressResponse {
  success: boolean;
  message: string;
  data?: ShippingAddress;
}

// ===== API ENDPOINTS =====

export const shippingAddressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all shipping addresses
    getShippingAddresses: builder.query<ShippingAddressResponse, { userId?: string }>({
      query: ({ userId }) => ({
        url: userId ? `/shipping?userId=${userId}` : "/shipping",
        method: "GET",
      }),
      providesTags: ["ShippingAddress"],
    }),

    // Get single shipping address by ID
    getShippingAddressById: builder.query<SingleShippingAddressResponse, string>({
      query: (id) => ({
        url: `/shipping/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ShippingAddress", id }],
    }),

    // Get default shipping address
    getDefaultShippingAddress: builder.query<SingleShippingAddressResponse, { userId?: string }>({
      query: ({ userId }) => ({
        url: userId ? `/shipping?userId=${userId}` : "/shipping",
        method: "GET",
      }),
      transformResponse: (response: ShippingAddressResponse) => {
        const defaultAddress = response.data.find(address => address.isDefault);
        return {
          success: response.success,
          message: response.message,
          data: defaultAddress || undefined,
        };
      },
      providesTags: ["ShippingAddress"],
    }),

    // Create shipping address
    createShippingAddress: builder.mutation<SingleShippingAddressResponse, CreateShippingAddressData>({
      query: (data) => ({
        url: "/shipping",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ShippingAddress"],
    }),

    // Update shipping address
    updateShippingAddress: builder.mutation<
      SingleShippingAddressResponse,
      { id: string; data: UpdateShippingAddressData }
    >({
      query: ({ id, data }) => ({
        url: `/shipping/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ShippingAddress", id },
        "ShippingAddress",
      ],
    }),

    // Set default shipping address
    setDefaultShippingAddress: builder.mutation<SingleShippingAddressResponse, string>({
      query: (id) => ({
        url: `/shipping/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["ShippingAddress"],
    }),

    // Delete shipping address
    deleteShippingAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/shipping/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ShippingAddress", id },
        "ShippingAddress",
      ],
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useGetShippingAddressesQuery,
  useGetShippingAddressByIdQuery,
  useGetDefaultShippingAddressQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useSetDefaultShippingAddressMutation,
  useDeleteShippingAddressMutation,
} = shippingAddressApi;
