// Client Logo Service - Legacy interface for backward compatibility
// This service provides the interface expected by existing components

import { ClientLogoService as NewClientLogoService, type ClientLogoFormData } from './content-service';

// Legacy types to match existing component expectations
export interface ClientLogoData {
  id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientLogoData {
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateClientLogoData {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  altText?: string;
  isActive?: boolean;
  order?: number;
}

// Legacy service that wraps the new API
export const clientLogoService = {
  async getClientLogos(): Promise<ClientLogoData[]> {
    try {
      const response = await NewClientLogoService.getAll();
      if (response.success && response.data) {
        return response.data.map((logo: any) => ({
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          logoUrl: logo.logoUrl,
          websiteUrl: logo.websiteUrl,
          altText: logo.altText,
          isActive: logo.isActive,
          order: logo.order,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching client logos:', error);
      return [];
    }
  },

  async getActiveClientLogos(): Promise<ClientLogoData[]> {
    try {
      const response = await NewClientLogoService.getActive();
      if (response.success && response.data) {
        return response.data.map((logo: any) => ({
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          logoUrl: logo.logoUrl,
          websiteUrl: logo.websiteUrl,
          altText: logo.altText,
          isActive: logo.isActive,
          order: logo.order,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching active client logos:', error);
      return [];
    }
  },

  async createClientLogo(data: CreateClientLogoData): Promise<ClientLogoData> {
    try {
      const response = await NewClientLogoService.create(data);
      if (response.success && response.data) {
        const logo = response.data;
        return {
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          logoUrl: logo.logoUrl,
          websiteUrl: logo.websiteUrl,
          altText: logo.altText,
          isActive: logo.isActive,
          order: logo.order,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to create client logo');
    } catch (error) {
      console.error('Error creating client logo:', error);
      throw error;
    }
  },

  async updateClientLogo(id: string, data: UpdateClientLogoData): Promise<ClientLogoData> {
    try {
      const response = await NewClientLogoService.update(id, data);
      if (response.success && response.data) {
        const logo = response.data;
        return {
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          logoUrl: logo.logoUrl,
          websiteUrl: logo.websiteUrl,
          altText: logo.altText,
          isActive: logo.isActive,
          order: logo.order,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to update client logo');
    } catch (error) {
      console.error('Error updating client logo:', error);
      throw error;
    }
  },

  async deleteClientLogo(id: string): Promise<void> {
    try {
      const response = await NewClientLogoService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete client logo');
      }
    } catch (error) {
      console.error('Error deleting client logo:', error);
      throw error;
    }
  },

  async reorderClientLogos(updates: { id: string; order: number }[]): Promise<void> {
    try {
      const response = await NewClientLogoService.reorder({ updates });
      if (!response.success) {
        throw new Error(response.message || 'Failed to reorder client logos');
      }
    } catch (error) {
      console.error('Error reordering client logos:', error);
      throw error;
    }
  }
};
