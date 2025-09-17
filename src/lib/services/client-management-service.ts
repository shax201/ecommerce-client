// Client Management Service Types and Interfaces

export interface Client {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: number;
  address?: string;
  status?: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  newClientsThisMonth: number;
  newClientsThisWeek: number;
  lastLoginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  totalUsers: number;
  adminUsers: number;
  clientUsers: number;
  clientsByMonth?: Array<{
    month: string;
    count: number;
  }>;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: number;
  address?: string;
  status?: boolean;
  image?: string;
}

export interface UpdateClientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: number;
  address?: string;
  status?: boolean;
  image?: string;
}

export interface UpdateClientProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: number;
  address?: string;
  image?: string;
}

export interface ChangePasswordRequest {
  clientId: string;
  oldPassword: string;
  newPassword: string;
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data?: Client | Client[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ClientLoginRequest {
  email: string;
  password: string;
}

export interface ClientLoginResponse {
  success: boolean;
  message: string;
  data?: {
    client: Client;
    token: string;
  };
}
