'use server';

import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface CourierProvider {
  _id: string;
  name: string;
  code: string;
  displayName: string;
  isActive: boolean;
  supportedFeatures: {
    realTimeTracking: boolean;
    rateCalculation: boolean;
    labelGeneration: boolean;
    cancellation: boolean;
    webhookSupport: boolean;
    codSupport: boolean;
    storeManagement: boolean;
    bulkOrders: boolean;
  };
  deliveryTypes: {
    standard: { code: number; name: string; estimatedDays: number };
    express: { code: number; name: string; estimatedDays: number };
    overnight?: { code: number; name: string; estimatedDays: number };
  };
}

export interface CourierCredentials {
  _id: string;
  clientId: string;
  courierProviderId: CourierProvider;
  credentials: {
    clientId: string;
    clientSecret: string;
    username?: string;
    password?: string;
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: string;
    additionalConfig?: Record<string, any>;
  };
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  settings: {
    autoBooking: boolean;
    preferredDeliveryType: string;
    maxWeight: number;
    maxValue: number;
    allowedCities: string[];
    excludedCities: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface TestCredentialsResult {
  success: boolean;
  message: string;
  capabilities: any;
}

// Get all available courier providers
export async function getCourierProviders(): Promise<{
  success: boolean;
  data?: CourierProvider[];
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching courier providers:', error);
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch courier providers',
        details: error
      }
    };
  }
}

// Get client's courier credentials
export async function getClientCredentials(clientId: string): Promise<{
  success: boolean;
  data?: CourierCredentials[];
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/clients/${clientId}/credentials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client credentials:', error);
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch client credentials',
        details: error
      }
    };
  }
}

// Save courier credentials
export async function saveCourierCredentials(
  clientId: string,
  providerId: string,
  credentials: any,
  settings?: any
): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/clients/${clientId}/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        clientId,
        providerId,
        credentials,
        settings
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      revalidatePath('/admin/courier');
    }
    
    return data;
  } catch (error) {
    console.error('Error saving courier credentials:', error);
    return {
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: 'Failed to save courier credentials',
        details: error
      }
    };
  }
}

// Test courier credentials
export async function testCourierCredentials(
  providerCode: string,
  credentials: any
): Promise<{
  success: boolean;
  data?: TestCredentialsResult;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/test-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        providerCode,
        credentials
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing courier credentials:', error);
    return {
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Failed to test courier credentials',
        details: error
      }
    };
  }
}

// Update courier credentials
export async function updateCourierCredentials(
  credentialId: string,
  credentials: any,
  settings?: any
): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/credentials/${credentialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        credentials,
        settings
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      revalidatePath('/admin/courier');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating courier credentials:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update courier credentials',
        details: error
      }
    };
  }
}

// Delete courier credentials
export async function deleteCourierCredentials(credentialId: string): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/credentials/${credentialId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    if (data.success) {
      revalidatePath('/admin/courier');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting courier credentials:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete courier credentials',
        details: error
      }
    };
  }
}

// Toggle credential status
export async function toggleCredentialStatus(
  credentialId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/credentials/${credentialId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        isActive
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      revalidatePath('/admin/courier');
    }
    
    return data;
  } catch (error) {
    console.error('Error toggling credential status:', error);
    return {
      success: false,
      error: {
        code: 'TOGGLE_ERROR',
        message: 'Failed to toggle credential status',
        details: error
      }
    };
  }
}

// Get provider capabilities
export async function getProviderCapabilities(providerCode: string): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/courier-credentials/providers/${providerCode}/capabilities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching provider capabilities:', error);
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch provider capabilities',
        details: error
      }
    };
  }
}
