interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  permissions?: string[];
  isEmailVerified: boolean;
}

interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'client';
  status?: 'active' | 'inactive' | 'suspended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  clientUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  lastLoginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'client';
  password: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  permissions?: string[];
}

interface BulkOperationData {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'changeRole';
  data?: {
    role?: 'admin' | 'client';
    status?: 'active' | 'inactive' | 'suspended';
    permissions?: string[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class UserManagementService {
  private baseUrl = '/api/v1/user-management';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get all users with pagination and filtering
  async getUsers(query: UserQuery = {}): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<User[]>(`?${queryString}`);
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/${id}`);
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return this.request<User>('', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<ApiResponse<User>> {
    return this.request<User>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Search users
  async searchUsers(searchTerm: string, filters: { role?: string; status?: string } = {}): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams({ q: searchTerm });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });

    return this.request<User[]>(`/search?${searchParams.toString()}`);
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.request<UserStats>('/stats');
  }

  // Update user status
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended', reason?: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  // Update user role
  async updateUserRole(id: string, role: 'admin' | 'client', permissions?: string[]): Promise<ApiResponse<User>> {
    return this.request<User>(`/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions }),
    });
  }

  // Change user password
  async changePassword(id: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  // Reset user password
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Bulk operations
  async bulkOperation(data: BulkOperationData): Promise<ApiResponse<any>> {
    return this.request('/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const userManagementService = new UserManagementService();
export type { User, UserQuery, UserStats, CreateUserData, UpdateUserData, BulkOperationData, ApiResponse };
