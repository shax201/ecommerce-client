// Content Management Service
// This service provides a clean interface for content management operations

import {
  createLogo,
  getLogos,
  getActiveLogosByType,
  getLogoById,
  updateLogo,
  deleteLogo,
  createHeroSection,
  getHeroSections,
  getActiveHeroSections,
  getHeroSectionById,
  updateHeroSection,
  deleteHeroSection,
  reorderHeroSections,
  createClientLogo,
  getClientLogos,
  getActiveClientLogos,
  getClientLogoById,
  updateClientLogo,
  deleteClientLogo,
  reorderClientLogos,
  getFooter,
  updateFooter,
  updateContactInfo,
  addFooterSection,
  updateFooterSection,
  deleteFooterSection,
  addFooterLink,
  updateFooterLink,
  deleteFooterLink,
  getNavbar,
  updateNavbar,
  addNavbarMenu,
  updateNavbarMenu,
  deleteNavbarMenu,
  addNavbarMenuItem,
  updateNavbarMenuItem,
  deleteNavbarMenuItem,
  reorderNavbarMenus,
  reorderNavbarMenuItems,
  type LogoFormData,
  type LogoFilters,
  type HeroSectionFormData,
  type HeroSectionFilters,
  type ReorderRequest,
  type ClientLogoFormData,
  type ClientLogoFilters,
  type FooterFormData,
  type ContactInfoFormData,
  type FooterSectionFormData,
  type FooterLinkFormData,
  type NavbarFormData,
  type NavbarMenuFormData,
  type NavbarMenuItemFormData,
  type ContentResponse
} from '@/actions/content';

// ===== LOGO SERVICE =====
export class LogoService {
  static async create(data: LogoFormData): Promise<ContentResponse> {
    return await createLogo(data);
  }

  static async getAll(filters: LogoFilters = {}): Promise<ContentResponse> {
    return await getLogos(filters);
  }

  static async getActiveByType(type: string): Promise<ContentResponse> {
    return await getActiveLogosByType(type);
  }

  static async getById(id: string): Promise<ContentResponse> {
    return await getLogoById(id);
  }

  static async update(id: string, data: Partial<LogoFormData>): Promise<ContentResponse> {
    return await updateLogo(id, data);
  }

  static async delete(id: string): Promise<ContentResponse> {
    return await deleteLogo(id);
  }
}

// ===== HERO SECTION SERVICE =====
export class HeroSectionService {
  static async create(data: HeroSectionFormData): Promise<ContentResponse> {
    return await createHeroSection(data);
  }

  static async getAll(filters: HeroSectionFilters = {}): Promise<ContentResponse> {
    return await getHeroSections(filters);
  }

  static async getActive(): Promise<ContentResponse> {
    return await getActiveHeroSections();
  }

  static async getById(id: string): Promise<ContentResponse> {
    return await getHeroSectionById(id);
  }

  static async update(id: string, data: Partial<HeroSectionFormData>): Promise<ContentResponse> {
    return await updateHeroSection(id, data);
  }

  static async delete(id: string): Promise<ContentResponse> {
    return await deleteHeroSection(id);
  }

  static async reorder(updates: ReorderRequest): Promise<ContentResponse> {
    return await reorderHeroSections(updates);
  }
}

// ===== CLIENT LOGO SERVICE =====
export class ClientLogoService {
  static async create(data: ClientLogoFormData): Promise<ContentResponse> {
    return await createClientLogo(data);
  }

  static async getAll(filters: ClientLogoFilters = {}): Promise<ContentResponse> {
    return await getClientLogos(filters);
  }

  static async getActive(): Promise<ContentResponse> {
    return await getActiveClientLogos();
  }

  static async getById(id: string): Promise<ContentResponse> {
    return await getClientLogoById(id);
  }

  static async update(id: string, data: Partial<ClientLogoFormData>): Promise<ContentResponse> {
    return await updateClientLogo(id, data);
  }

  static async delete(id: string): Promise<ContentResponse> {
    return await deleteClientLogo(id);
  }

  static async reorder(updates: ReorderRequest): Promise<ContentResponse> {
    return await reorderClientLogos(updates);
  }
}

// ===== FOOTER SERVICE =====
export class FooterService {
  static async get(): Promise<ContentResponse> {
    return await getFooter();
  }

  static async update(data: FooterFormData): Promise<ContentResponse> {
    return await updateFooter(data);
  }

  static async updateContactInfo(data: ContactInfoFormData): Promise<ContentResponse> {
    return await updateContactInfo(data);
  }

  // Footer Sections
  static async addSection(data: FooterSectionFormData): Promise<ContentResponse> {
    return await addFooterSection(data);
  }

  static async updateSection(sectionId: string, data: Partial<FooterSectionFormData>): Promise<ContentResponse> {
    return await updateFooterSection(sectionId, data);
  }

  static async deleteSection(sectionId: string): Promise<ContentResponse> {
    return await deleteFooterSection(sectionId);
  }

  // Footer Links
  static async addLink(sectionId: string, data: FooterLinkFormData): Promise<ContentResponse> {
    return await addFooterLink(sectionId, data);
  }

  static async updateLink(sectionId: string, linkId: string, data: Partial<FooterLinkFormData>): Promise<ContentResponse> {
    return await updateFooterLink(sectionId, linkId, data);
  }

  static async deleteLink(sectionId: string, linkId: string): Promise<ContentResponse> {
    return await deleteFooterLink(sectionId, linkId);
  }
}

// ===== NAVBAR SERVICE =====
export class NavbarService {
  static async get(): Promise<ContentResponse> {
    return await getNavbar();
  }

  static async update(data: NavbarFormData): Promise<ContentResponse> {
    return await updateNavbar(data);
  }
}

// ===== NAVBAR MENU SERVICE =====
export class NavbarMenuService {
  static async create(data: NavbarMenuFormData): Promise<ContentResponse> {
    return await addNavbarMenu(data);
  }

  static async update(menuId: number, data: Partial<NavbarMenuFormData>): Promise<ContentResponse> {
    return await updateNavbarMenu(menuId, data);
  }

  static async delete(menuId: number): Promise<ContentResponse> {
    return await deleteNavbarMenu(menuId);
  }

  static async reorder(updates: ReorderRequest[]): Promise<ContentResponse> {
    return await reorderNavbarMenus(updates);
  }
}

// ===== NAVBAR MENU ITEM SERVICE =====
export class NavbarMenuItemService {
  static async create(menuId: number, data: NavbarMenuItemFormData): Promise<ContentResponse> {
    return await addNavbarMenuItem(menuId, data);
  }

  static async update(menuId: number, menuItemId: number, data: Partial<NavbarMenuItemFormData>): Promise<ContentResponse> {
    return await updateNavbarMenuItem(menuId, menuItemId, data);
  }

  static async delete(menuId: number, menuItemId: number): Promise<ContentResponse> {
    return await deleteNavbarMenuItem(menuId, menuItemId);
  }

  static async reorder(menuId: number, updates: ReorderRequest[]): Promise<ContentResponse> {
    return await reorderNavbarMenuItems(menuId, updates);
  }
}

// ===== TYPE EXPORTS =====
export type {
  LogoFormData,
  LogoFilters,
  HeroSectionFormData,
  HeroSectionFilters,
  ReorderRequest,
  ClientLogoFormData,
  ClientLogoFilters,
  FooterFormData,
  ContactInfoFormData,
  FooterSectionFormData,
  FooterLinkFormData,
  NavbarFormData,
  NavbarMenuFormData,
  NavbarMenuItemFormData,
  ContentResponse
} from '@/actions/content';
