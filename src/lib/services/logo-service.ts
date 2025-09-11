// Logo Service - Legacy interface for backward compatibility
// This service provides the interface expected by existing components

import { LogoService as NewLogoService, type LogoFormData } from './content-service';

// Legacy types to match existing component expectations
export interface LogoData {
  id: string;
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLogoData {
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}

export interface UpdateLogoData {
  name?: string;
  description?: string;
  url?: string;
  altText?: string;
  type?: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}

// Legacy service that wraps the new API
export const logoService = {
  async getLogos(): Promise<LogoData[]> {
    try {
      const response = await NewLogoService.getAll();
      console.log('response', response)
      if (response.success && response.data) {
        return response.data.map((logo: any) => ({
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          url: logo.url,
          altText: logo.altText,
          type: logo.type,
          isActive: logo.isActive,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching logos:', error);
      return [];
    }
  },

  async createLogo(data: CreateLogoData): Promise<LogoData> {
    try {
      const response = await NewLogoService.create(data);
      if (response.success && response.data) {
        const logo = response.data;
        return {
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          url: logo.url,
          altText: logo.altText,
          type: logo.type,
          isActive: logo.isActive,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to create logo');
    } catch (error) {
      console.error('Error creating logo:', error);
      throw error;
    }
  },

  async updateLogo(id: string, data: UpdateLogoData): Promise<LogoData> {
    try {
      const response = await NewLogoService.update(id, data);
      if (response.success && response.data) {
        const logo = response.data;
        return {
          id: logo._id || logo.id,
          name: logo.name,
          description: logo.description,
          url: logo.url,
          altText: logo.altText,
          type: logo.type,
          isActive: logo.isActive,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to update logo');
    } catch (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
  },

  async deleteLogo(id: string): Promise<void> {
    try {
      const response = await NewLogoService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete logo');
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  }
};