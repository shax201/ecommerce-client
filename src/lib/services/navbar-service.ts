// Navbar Service
// This service provides a clean interface for navbar management operations

import {
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
  type NavbarFormData,
  type NavbarMenuFormData,
  type NavbarMenuItemFormData,
  type ReorderRequest,
  type ContentResponse
} from '@/actions/content';

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

// ===== LEGACY INTERFACE FOR COMPONENT COMPATIBILITY =====

// Legacy types to match existing component expectations
export interface NavbarData {
  _id?: string;
  menus: NavbarMenuData[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavbarMenuData {
  _id?: string;
  id: number;
  label: string;
  type: 'MenuItem' | 'MenuList';
  url?: string;
  children?: NavbarMenuItemData[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavbarMenuItemData {
  _id?: string;
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNavbarMenuData {
  id: number;
  label: string;
  type: 'MenuItem' | 'MenuList';
  url?: string;
  children?: CreateNavbarMenuItemData[];
  isActive?: boolean;
  order?: number;
}

export interface UpdateNavbarMenuData {
  label?: string;
  type?: 'MenuItem' | 'MenuList';
  url?: string;
  children?: CreateNavbarMenuItemData[];
  isActive?: boolean;
  order?: number;
}

export interface CreateNavbarMenuItemData {
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateNavbarMenuItemData {
  label?: string;
  url?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

// Legacy service that wraps the new API
export const navbarService = {
  async getNavbar(): Promise<NavbarData | null> {
    try {
      const response = await NavbarService.get();
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching navbar:', error);
      throw error;
    }
  },

  async updateNavbar(data: NavbarData): Promise<NavbarData | null> {
    try {
      const response = await NavbarService.update(data);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error updating navbar:', error);
      throw error;
    }
  },

  async addNavbarMenu(data: CreateNavbarMenuData): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuService.create(data);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error adding navbar menu:', error);
      throw error;
    }
  },

  async updateNavbarMenu(menuId: number, data: UpdateNavbarMenuData): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuService.update(menuId, data);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error updating navbar menu:', error);
      throw error;
    }
  },

  async deleteNavbarMenu(menuId: number): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuService.delete(menuId);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error deleting navbar menu:', error);
      throw error;
    }
  },

  async addNavbarMenuItem(menuId: number, data: CreateNavbarMenuItemData): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuItemService.create(menuId, data);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error adding navbar menu item:', error);
      throw error;
    }
  },

  async updateNavbarMenuItem(menuId: number, menuItemId: number, data: UpdateNavbarMenuItemData): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuItemService.update(menuId, menuItemId, data);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error updating navbar menu item:', error);
      throw error;
    }
  },

  async deleteNavbarMenuItem(menuId: number, menuItemId: number): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuItemService.delete(menuId, menuItemId);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error deleting navbar menu item:', error);
      throw error;
    }
  },

  async reorderNavbarMenus(updates: ReorderRequest[]): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuService.reorder(updates);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error reordering navbar menus:', error);
      throw error;
    }
  },

  async reorderNavbarMenuItems(menuId: number, updates: ReorderRequest[]): Promise<NavbarData | null> {
    try {
      const response = await NavbarMenuItemService.reorder(menuId, updates);
      if (response.success && response.data) {
        return response.data as NavbarData;
      }
      return null;
    } catch (error) {
      console.error('Error reordering navbar menu items:', error);
      throw error;
    }
  },
};
