import { 
  UserProfile, 
  UserPreferences, 
  UpdateProfileRequest, 
  UpdateEmailRequest, 
  ChangePasswordRequest, 
  UpdatePhoneRequest, 
  UpdatePreferencesRequest 
} from './userSettingsApi';

// ===== SERVICE CLASS =====

export class UserSettingsService {
  private static baseUrl = '/api/v1/user-settings';

  // ===== PROFILE METHODS =====

  /**
   * Get user's own profile
   */
  static async getOwnProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update user's own profile (names only)
   */
  static async updateOwnProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    return result.data;
  }

  // ===== EMAIL METHODS =====

  /**
   * Update user's own email
   */
  static async updateOwnEmail(data: UpdateEmailRequest): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update email');
    }

    const result = await response.json();
    return result.data;
  }

  // ===== PASSWORD METHODS =====

  /**
   * Change user's own password
   */
  static async changeOwnPassword(data: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    const result = await response.json();
    return result.data;
  }

  // ===== PHONE METHODS =====

  /**
   * Update user's own phone
   */
  static async updateOwnPhone(data: UpdatePhoneRequest): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/phone`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update phone');
    }

    const result = await response.json();
    return result.data;
  }

  // ===== PREFERENCES METHODS =====

  /**
   * Get user's own preferences
   */
  static async getOwnPreferences(): Promise<UserPreferences> {
    const response = await fetch(`${this.baseUrl}/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch preferences');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update user's own preferences
   */
  static async updateOwnPreferences(data: UpdatePreferencesRequest): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update preferences');
    }

    const result = await response.json();
    return result.data;
  }

  // ===== UTILITY METHODS =====

  /**
   * Get authentication token from localStorage
   */
  private static getToken(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    // Try to get token from localStorage
    const token = localStorage.getItem('user-token') || localStorage.getItem('admin-token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return token;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Format phone number for display
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
  }

  /**
   * Get user's full name
   */
  static getFullName(profile: UserProfile | null): string {
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  }

  /**
   * Get user's initials
   */
  static getInitials(profile: UserProfile | null): string {
    if (!profile) return '';
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  }
}
