// Footer Service - Legacy interface for backward compatibility
// This service provides the interface expected by existing components

import { FooterService as NewFooterService, type FooterFormData, type ContactInfoFormData, type FooterSectionFormData, type FooterLinkFormData } from './content-service';

// Legacy types to match existing component expectations
export interface FooterLink {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  isActive: boolean;
  order: number;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

export interface FooterData {
  id?: string;
  sections: FooterSection[];
  contactInfo: ContactInfo;
  copyright: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFooterSectionData {
  title: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFooterSectionData {
  title?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateFooterLinkData {
  title: string;
  url: string;
  isExternal?: boolean;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFooterLinkData {
  title?: string;
  url?: string;
  isExternal?: boolean;
  isActive?: boolean;
  order?: number;
}

// Legacy service that wraps the new API
export const footerService = {
  async getFooter(): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.get();
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching footer:', error);
      return null;
    }
  },

  async updateFooter(data: Partial<FooterFormData>): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.update(data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating footer:', error);
      return null;
    }
  },

  async updateContactInfo(data: ContactInfoFormData): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.updateContactInfo(data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating contact info:', error);
      return null;
    }
  },

  // Footer Section methods
  async addFooterSection(data: CreateFooterSectionData): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.addSection(data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error adding footer section:', error);
      return null;
    }
  },

  async updateFooterSection(sectionId: string, data: UpdateFooterSectionData): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.updateSection(sectionId, data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating footer section:', error);
      return null;
    }
  },

  async deleteFooterSection(sectionId: string): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.deleteSection(sectionId);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error deleting footer section:', error);
      return null;
    }
  },

  // Footer Link methods
  async addFooterLink(sectionId: string, data: CreateFooterLinkData): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.addLink(sectionId, data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error adding footer link:', error);
      return null;
    }
  },

  async updateFooterLink(sectionId: string, linkId: string, data: UpdateFooterLinkData): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.updateLink(sectionId, linkId, data);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating footer link:', error);
      return null;
    }
  },

  async deleteFooterLink(sectionId: string, linkId: string): Promise<FooterData | null> {
    try {
      const response = await NewFooterService.deleteLink(sectionId, linkId);
      if (response.success && response.data) {
        const footer = response.data;
        return {
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error deleting footer link:', error);
      return null;
    }
  }
};
