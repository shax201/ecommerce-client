// Hero Section Service - Legacy interface for backward compatibility
// This service provides the interface expected by existing components

import { HeroSectionService as NewHeroSectionService, type HeroSectionFormData } from './content-service';

// Legacy types to match existing component expectations
export interface HeroSectionData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHeroSectionData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateHeroSectionData {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive?: boolean;
  order?: number;
}

// Legacy service that wraps the new API
export const heroSectionService = {
  async getHeroSections(): Promise<HeroSectionData[]> {
    try {
      const response = await NewHeroSectionService.getAll();
      if (response.success && response.data) {
        return response.data.map((hero: any) => ({
          id: hero._id || hero.id,
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          primaryButtonText: hero.primaryButtonText,
          primaryButtonLink: hero.primaryButtonLink,
          secondaryButtonText: hero.secondaryButtonText,
          secondaryButtonLink: hero.secondaryButtonLink,
          backgroundImage: hero.backgroundImage,
          backgroundImageAlt: hero.backgroundImageAlt,
          isActive: hero.isActive,
          order: hero.order,
          createdAt: hero.createdAt,
          updatedAt: hero.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      return [];
    }
  },

  async getActiveHeroSections(): Promise<HeroSectionData[]> {
    try {
      const response = await NewHeroSectionService.getActive();
      if (response.success && response.data) {
        return response.data.map((hero: any) => ({
          id: hero._id || hero.id,
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          primaryButtonText: hero.primaryButtonText,
          primaryButtonLink: hero.primaryButtonLink,
          secondaryButtonText: hero.secondaryButtonText,
          secondaryButtonLink: hero.secondaryButtonLink,
          backgroundImage: hero.backgroundImage,
          backgroundImageAlt: hero.backgroundImageAlt,
          isActive: hero.isActive,
          order: hero.order,
          createdAt: hero.createdAt,
          updatedAt: hero.updatedAt
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching active hero sections:', error);
      return [];
    }
  },

  async createHeroSection(data: CreateHeroSectionData): Promise<HeroSectionData> {
    try {
      const response = await NewHeroSectionService.create(data);
      if (response.success && response.data) {
        const hero = response.data;
        return {
          id: hero._id || hero.id,
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          primaryButtonText: hero.primaryButtonText,
          primaryButtonLink: hero.primaryButtonLink,
          secondaryButtonText: hero.secondaryButtonText,
          secondaryButtonLink: hero.secondaryButtonLink,
          backgroundImage: hero.backgroundImage,
          backgroundImageAlt: hero.backgroundImageAlt,
          isActive: hero.isActive,
          order: hero.order,
          createdAt: hero.createdAt,
          updatedAt: hero.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to create hero section');
    } catch (error) {
      console.error('Error creating hero section:', error);
      throw error;
    }
  },

  async updateHeroSection(id: string, data: UpdateHeroSectionData): Promise<HeroSectionData> {
    try {
      const response = await NewHeroSectionService.update(id, data);
      if (response.success && response.data) {
        const hero = response.data;
        return {
          id: hero._id || hero.id,
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          primaryButtonText: hero.primaryButtonText,
          primaryButtonLink: hero.primaryButtonLink,
          secondaryButtonText: hero.secondaryButtonText,
          secondaryButtonLink: hero.secondaryButtonLink,
          backgroundImage: hero.backgroundImage,
          backgroundImageAlt: hero.backgroundImageAlt,
          isActive: hero.isActive,
          order: hero.order,
          createdAt: hero.createdAt,
          updatedAt: hero.updatedAt
        };
      }
      throw new Error(response.message || 'Failed to update hero section');
    } catch (error) {
      console.error('Error updating hero section:', error);
      throw error;
    }
  },

  async deleteHeroSection(id: string): Promise<void> {
    try {
      const response = await NewHeroSectionService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete hero section');
      }
    } catch (error) {
      console.error('Error deleting hero section:', error);
      throw error;
    }
  },

  async reorderHeroSections(updates: { id: string; order: number }[]): Promise<void> {
    try {
      const response = await NewHeroSectionService.reorder({ updates });
      if (!response.success) {
        throw new Error(response.message || 'Failed to reorder hero sections');
      }
    } catch (error) {
      console.error('Error reordering hero sections:', error);
      throw error;
    }
  }
};
