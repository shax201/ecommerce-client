"use server";

// ===== TYPES =====
export interface ContentResponse {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// Logo Types
export interface LogoFormData {
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}

export interface LogoFilters {
  type?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Hero Section Types
export interface HeroSectionFormData {
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

export interface HeroSectionFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ReorderRequest {
  updates: { id: string; order: number }[];
}

// Dynamic Menu Types
export interface DynamicMenuFormData {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
}

export interface DynamicMenuItemFormData {
  label: string;
  url: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  isActive?: boolean;
  order?: number;
  parentId?: number;
}

export interface DynamicMenuFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Navbar Types
export interface NavbarFormData {
  menus: NavbarMenuFormData[];
  isActive?: boolean;
}

export interface NavbarMenuFormData {
  id: number;
  label: string;
  type: 'MenuItem' | 'MenuList';
  url?: string;
  children?: NavbarMenuItemFormData[];
  isActive?: boolean;
  order?: number;
}

export interface NavbarMenuItemFormData {
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

// Client Logo Types
export interface ClientLogoFormData {
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive?: boolean;
  order?: number;
}

export interface ClientLogoFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Footer Types
export interface FooterFormData {
  copyright?: string;
  description?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export interface ContactInfoFormData {
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

export interface FooterSectionFormData {
  title: string;
  isActive?: boolean;
  order?: number;
}

export interface FooterLinkFormData {
  title: string;
  url: string;
  isExternal?: boolean;
  isActive?: boolean;
  order?: number;
}

// ===== HELPER FUNCTIONS =====
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
};

const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (response.ok && data.success) {
    return {
      success: true,
      message: data.message || 'Operation successful',
      data: data.data,
      pagination: data.pagination
    };
  } else {
    return {
      success: false,
      message: data.message || 'Operation failed',
      data: data.data
    };
  }
};

const handleApiError = (error: any, operation: string): ContentResponse => {
  console.error(`Error in ${operation}:`, error);
  return {
    success: false,
    message: `An error occurred during ${operation}`,
  };
};

// ===== LOGO API FUNCTIONS =====
export async function createLogo(formData: LogoFormData): Promise<ContentResponse> {
  if (!formData.name?.trim()) {
    return { success: false, message: "Logo name is required." };
  }
  if (!formData.url?.trim()) {
    return { success: false, message: "Logo URL is required." };
  }
  if (!formData.altText?.trim()) {
    return { success: false, message: "Alt text is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/logos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "creating logo");
  }
}

export async function getLogos(filters: LogoFilters = {}): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${getBackendUrl()}/content/logos?${queryParams.toString()}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching logos");
  }
}

export async function getActiveLogosByType(type: string): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/logos/active/${type}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching active logos");
  }
}

export async function getLogoById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/logos/${id}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching logo");
  }
}

export async function updateLogo(id: string, formData: Partial<LogoFormData>): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/logos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating logo");
  }
}

export async function deleteLogo(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/logos/${id}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting logo");
  }
}

// ===== HERO SECTION API FUNCTIONS =====
export async function createHeroSection(formData: HeroSectionFormData): Promise<ContentResponse> {
  if (!formData.title?.trim()) {
    return { success: false, message: "Hero section title is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "creating hero section");
  }
}

export async function getHeroSections(filters: HeroSectionFilters = {}): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${getBackendUrl()}/content/hero-sections?${queryParams.toString()}`);
    console.log('response', response)
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching hero sections");
  }
}

export async function getActiveHeroSections(): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections/active`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching active hero sections");
  }
}

export async function getHeroSectionById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections/${id}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching hero section");
  }
}

export async function updateHeroSection(id: string, formData: Partial<HeroSectionFormData>): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating hero section");
  }
}

export async function deleteHeroSection(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections/${id}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting hero section");
  }
}

export async function reorderHeroSections(updates: ReorderRequest): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/hero-sections/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "reordering hero sections");
  }
}

// ===== CLIENT LOGO API FUNCTIONS =====
export async function createClientLogo(formData: ClientLogoFormData): Promise<ContentResponse> {
  if (!formData.name?.trim()) {
    return { success: false, message: "Client logo name is required." };
  }
  if (!formData.logoUrl?.trim()) {
    return { success: false, message: "Logo URL is required." };
  }
  if (!formData.altText?.trim()) {
    return { success: false, message: "Alt text is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "creating client logo");
  }
}

export async function getClientLogos(filters: ClientLogoFilters = {}): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${getBackendUrl()}/content/client-logos?${queryParams.toString()}`);
    console.log('response', response)
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching client logos");
  }
}

export async function getActiveClientLogos(): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos/active`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching active client logos");
  }
}

export async function getClientLogoById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos/${id}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching client logo");
  }
}

export async function updateClientLogo(id: string, formData: Partial<ClientLogoFormData>): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating client logo");
  }
}

export async function deleteClientLogo(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos/${id}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting client logo");
  }
}

export async function reorderClientLogos(updates: ReorderRequest): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/client-logos/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "reordering client logos");
  }
}

// ===== FOOTER API FUNCTIONS =====
export async function getFooter(): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/footer`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching footer");
  }
}

export async function updateFooter(formData: FooterFormData): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/footer`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating footer");
  }
}

export async function updateContactInfo(formData: ContactInfoFormData): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/contact-info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating contact info");
  }
}

// ===== FOOTER SECTION API FUNCTIONS =====
export async function addFooterSection(formData: FooterSectionFormData): Promise<ContentResponse> {
  if (!formData.title?.trim()) {
    return { success: false, message: "Footer section title is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "adding footer section");
  }
}

export async function updateFooterSection(sectionId: string, formData: Partial<FooterSectionFormData>): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections/${sectionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating footer section");
  }
}

export async function deleteFooterSection(sectionId: string): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }

  console.log('sectionId', sectionId)
  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections/${sectionId}`, {
      method: "DELETE",
    });


   const result =  await handleApiResponse(response);
   console.log('result', result);

   return result
  } catch (error) {
    return handleApiError(error, "deleting footer section");
  }
}

// ===== FOOTER LINK API FUNCTIONS =====
export async function addFooterLink(sectionId: string, formData: FooterLinkFormData): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }
  if (!formData.title?.trim()) {
    return { success: false, message: "Footer link title is required." };
  }
  if (!formData.url?.trim()) {
    return { success: false, message: "Footer link URL is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections/${sectionId}/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "adding footer link");
  }
}

export async function updateFooterLink(sectionId: string, linkId: string, formData: Partial<FooterLinkFormData>): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }
  if (!linkId) {
    return { success: false, message: "Footer link ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections/${sectionId}/links/${linkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating footer link");
  }
}

export async function deleteFooterLink(sectionId: string, linkId: string): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }
  if (!linkId) {
    return { success: false, message: "Footer link ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/footer/sections/${sectionId}/links/${linkId}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting footer link");
  }
}

// ===== NAVBAR FUNCTIONS =====

export async function getNavbar(): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar`, {
      method: "GET",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching navbar");
  }
}

export async function updateNavbar(formData: NavbarFormData): Promise<ContentResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating navbar");
  }
}

export async function addNavbarMenu(formData: NavbarMenuFormData): Promise<ContentResponse> {
  if (!formData.label?.trim()) {
    return { success: false, message: "Menu label is required." };
  }
  if (!formData.type) {
    return { success: false, message: "Menu type is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "adding navbar menu");
  }
}

export async function updateNavbarMenu(menuId: number, formData: Partial<NavbarMenuFormData>): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating navbar menu");
  }
}

export async function deleteNavbarMenu(menuId: number): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting navbar menu");
  }
}

export async function addNavbarMenuItem(menuId: number, formData: NavbarMenuItemFormData): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!formData.label?.trim()) {
    return { success: false, message: "Menu item label is required." };
  }
  if (!formData.url?.trim()) {
    return { success: false, message: "Menu item URL is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "adding navbar menu item");
  }
}

export async function updateNavbarMenuItem(menuId: number, menuItemId: number, formData: Partial<NavbarMenuItemFormData>): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!menuItemId) {
    return { success: false, message: "Menu item ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}/items/${menuItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating navbar menu item");
  }
}

export async function deleteNavbarMenuItem(menuId: number, menuItemId: number): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!menuItemId) {
    return { success: false, message: "Menu item ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}/items/${menuItemId}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting navbar menu item");
  }
}

export async function reorderNavbarMenus(updates: ReorderRequest[]): Promise<ContentResponse> {
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "reordering navbar menus");
  }
}

export async function reorderNavbarMenuItems(menuId: number, updates: ReorderRequest[]): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/navbar/menus/${menuId}/items/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "reordering navbar menu items");
  }
}

// ===== DYNAMIC MENU API FUNCTIONS =====
export async function createDynamicMenu(formData: DynamicMenuFormData): Promise<ContentResponse> {
  if (!formData.name?.trim()) {
    return { success: false, message: "Menu name is required." };
  }
  if (!formData.slug?.trim()) {
    return { success: false, message: "Menu slug is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "creating dynamic menu");
  }
}

export async function getDynamicMenus(filters: DynamicMenuFilters = {}): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus?${queryParams.toString()}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menus");
  }
}

export async function getDynamicMenuById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${id}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menu");
  }
}

export async function getDynamicMenuBySlug(slug: string): Promise<ContentResponse> {
  if (!slug) {
    return { success: false, message: "Menu slug is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/slug/${slug}`);
    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menu by slug");
  }
}

export async function updateDynamicMenu(id: string, formData: Partial<DynamicMenuFormData>): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating dynamic menu");
  }
}

export async function deleteDynamicMenu(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${id}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting dynamic menu");
  }
}

// ===== DYNAMIC MENU ITEM API FUNCTIONS =====
export async function createDynamicMenuItem(menuId: string, formData: DynamicMenuItemFormData): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!formData.label?.trim()) {
    return { success: false, message: "Item label is required." };
  }
  if (!formData.url?.trim()) {
    return { success: false, message: "Item URL is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${menuId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "creating dynamic menu item");
  }
}

export async function updateDynamicMenuItem(menuId: string, itemId: number, formData: Partial<DynamicMenuItemFormData>): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!itemId) {
    return { success: false, message: "Item ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${menuId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "updating dynamic menu item");
  }
}

export async function deleteDynamicMenuItem(menuId: string, itemId: number): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!itemId) {
    return { success: false, message: "Item ID is required." };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${menuId}/items/${itemId}`, {
      method: "DELETE",
    });

    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "deleting dynamic menu item");
  }
}

export async function reorderDynamicMenuItems(menuId: string, updates: ReorderRequest[]): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  console.log('updates', updates)
  try {
    const response = await fetch(`${getBackendUrl()}/content/dynamic-menus/${menuId}/items/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });


    return await handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, "reordering dynamic menu items");
  }
}
