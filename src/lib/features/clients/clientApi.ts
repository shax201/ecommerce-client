import { 
  Client, 
  ClientQuery, 
  ClientStats, 
  CreateClientRequest, 
  UpdateClientRequest, 
  UpdateClientProfileRequest,
  ChangePasswordRequest,
  ClientLoginRequest,
  ClientLoginResponse,
  ClientResponse 
} from '@/lib/services/client-management-service';
import { apiSlice } from '../api/apiSlice';

export const clientApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all clients with pagination and filtering
    getClients: builder.query<ClientResponse, ClientQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.status !== undefined) searchParams.append('status', params.status.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/clients?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Client'],
    }),

    // Get client by ID
    getClientById: builder.query<ClientResponse, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    // Get client statistics
    getClientStats: builder.query<ClientStats, void>({
      query: () => '/clients/stats',
      providesTags: ['ClientStats'],
      transformResponse: (response: { success: boolean; data: ClientStats; message: string }) => {
        return response.data;
      },
    }),

    // Create new client
    createClient: builder.mutation<ClientResponse, CreateClientRequest>({
      query: (clientData) => ({
        url: '/clients',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Client', 'ClientStats'],
    }),

    // Update client
    updateClient: builder.mutation<ClientResponse, { id: string; data: UpdateClientRequest }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
        'ClientStats'
      ],
    }),

    // Update client status
    updateClientStatus: builder.mutation<ClientResponse, { id: string; status: boolean }>({
      query: ({ id, status }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: { status: status ? 'active' : 'inactive' }, // Convert boolean to string
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
        'ClientStats'
      ],
    }),

    // Update client profile (limited fields)
    updateClientProfile: builder.mutation<ClientResponse, { id: string; data: UpdateClientProfileRequest }>({
      query: ({ id, data }) => ({
        url: `/clients/profile/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client'
      ],
    }),

    // Change client password
    changeClientPassword: builder.mutation<ClientResponse, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: `/clients/${passwordData.clientId}/password`,
        method: 'PUT',
        body: {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
      }),
    }),

    // Delete client
    deleteClient: builder.mutation<ClientResponse, string>({
      query: (id) => {
        console.log('Delete client API call for ID:', id);
        return {
          url: `/clients/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Client', 'ClientStats'],
    }),

    // Client login (public endpoint)
    clientLogin: builder.mutation<ClientLoginResponse, ClientLoginRequest>({
      query: (loginData) => ({
        url: '/clients/login',
        method: 'POST',
        body: loginData,
      }),
    }),

    // Bulk operations
    bulkUpdateClientStatus: builder.mutation<ClientResponse, { ids: string[]; status: boolean }>({
      query: ({ ids, status }) => ({
        url: '/clients/bulk/status',
        method: 'PUT',
        body: { ids, status }, // Keep boolean for bulk operations as backend expects it
      }),
      invalidatesTags: ['Client', 'ClientStats'],
    }),

    bulkDeleteClients: builder.mutation<ClientResponse, string[]>({
      query: (ids) => ({
        url: '/clients/bulk/delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Client', 'ClientStats'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetClientStatsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useUpdateClientStatusMutation,
  useUpdateClientProfileMutation,
  useChangeClientPasswordMutation,
  useDeleteClientMutation,
  useClientLoginMutation,
  useBulkUpdateClientStatusMutation,
  useBulkDeleteClientsMutation,
} = clientApi;
