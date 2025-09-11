"use server";

import { unstable_cache } from "next/cache";
import { CONTENT_ISR_TAGS } from "@/lib/isr-tags";

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
  type: "main" | "footer" | "favicon";
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
  type: "MenuItem" | "MenuList";
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
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000"
  );
};

// ISR-compatible helper function with cache control
const fetchWithISR = async (
  url: string,
  options: RequestInit = {},
  revalidateSeconds: number = 60
) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Add cache control for ISR
    next: {
      revalidate: revalidateSeconds,
    },
  });
};

const handleApiResponse = async (response: Response, url: string) => {
  const data = await response.json();

  console.log(`🔍 API Response [${response.status}] - ${url}:`, {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
    headers: Object.fromEntries(response.headers.entries()),
  });

  if (response.ok && data.success) {
    return {
      success: true,
      message: data.message || "Operation successful",
      data: data.data,
      pagination: data.pagination,
    };
  } else {
    return {
      success: false,
      message: data.message || "Operation failed",
      data: data.data,
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
export async function createLogo(
  formData: LogoFormData
): Promise<ContentResponse> {
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
    const url = `${getBackendUrl()}/content/logos`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "creating logo");
  }
}

export async function getLogos(
  filters: LogoFilters = {}
): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.isActive !== undefined)
      queryParams.append("isActive", filters.isActive.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `${getBackendUrl()}/content/logos?${queryParams.toString()}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", filters });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching logos");
  }
}

export async function getActiveLogosByType(
  type: string
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/logos/active/${type}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", type });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching active logos");
  }
}

export async function getLogoById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", id });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching logo");
  }
}

export async function updateLogo(
  id: string,
  formData: Partial<LogoFormData>
): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      id,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating logo");
  }
}

export async function deleteLogo(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", id });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting logo");
  }
}

// ===== HERO SECTION API FUNCTIONS =====
export async function createHeroSection(
  formData: HeroSectionFormData
): Promise<ContentResponse> {
  if (!formData.title?.trim()) {
    return { success: false, message: "Hero section title is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/hero-sections`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "creating hero section");
  }
}

export async function getHeroSections(
  filters: HeroSectionFilters = {}
): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined)
      queryParams.append("isActive", filters.isActive.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `${getBackendUrl()}/content/hero-sections?${queryParams.toString()}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", filters });

    const response = await fetch(url);
    console.log("response", response);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching hero sections");
  }
}

export async function getActiveHeroSections(): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/hero-sections/active`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET" });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching active hero sections");
  }
}

// Cached function for fetching all hero sections with ISR
const fetchAllHeroSectionsData = unstable_cache(
  async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ sections: any[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());

      const url = `${getBackendUrl()}/content/hero-sections${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          sections: data.data || [],
          pagination: data.pagination || {
            total: data.data?.length || 0,
            page: params?.page || 1,
            totalPages: 1,
          },
        };
      }
      return { sections: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch (error) {
      console.error("Error fetching all hero sections data:", error);
      return { sections: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  },
  ["all-hero-sections"],
  {
    tags: [CONTENT_ISR_TAGS.HERO_SECTIONS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching all hero sections with ISR
export async function getAllHeroSectionsISR(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<ContentResponse> {
  try {
    const data = await fetchAllHeroSectionsData(params);

    return {
      success: true,
      message: "Hero sections fetched successfully",
      data: data.sections,
      pagination: data.pagination,
    };
  } catch (error) {
    return handleApiError(error, "fetching all hero sections for ISR");
  }
}

// Cached function for fetching single hero section with ISR
const fetchSingleHeroSectionData = unstable_cache(
  async (sectionId: string): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/hero-sections/${sectionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching single hero section data:", error);
      return null;
    }
  },
  ["single-hero-section"],
  {
    tags: [CONTENT_ISR_TAGS.HERO_SECTIONS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching single hero section with ISR
export async function getSingleHeroSectionISR(
  sectionId: string
): Promise<ContentResponse> {
  try {
    const data = await fetchSingleHeroSectionData(sectionId);

    if (data) {
      return {
        success: true,
        message: "Hero section fetched successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: "Hero section not found",
      };
    }
  } catch (error) {
    return handleApiError(error, "fetching single hero section for ISR");
  }
}

export async function getHeroSectionById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/hero-sections/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", id });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching hero section");
  }
}

export async function updateHeroSection(
  id: string,
  formData: Partial<HeroSectionFormData>
): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/hero-sections/${id}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      id,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating hero section");
  }
}

export async function deleteHeroSection(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Hero section ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/hero-sections/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", id });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting hero section");
  }
}

export async function reorderHeroSections(
  updates: ReorderRequest
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/hero-sections/reorder`;
    console.log(`🚀 API Request - ${url}:`, { method: "PUT", body: updates });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "reordering hero sections");
  }
}

// ===== CLIENT LOGO API FUNCTIONS =====
export async function createClientLogo(
  formData: ClientLogoFormData
): Promise<ContentResponse> {
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
    const url = `${getBackendUrl()}/content/client-logos`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "creating client logo");
  }
}

export async function getClientLogos(
  filters: ClientLogoFilters = {}
): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined)
      queryParams.append("isActive", filters.isActive.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `${getBackendUrl()}/content/client-logos?${queryParams.toString()}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", filters });

    const response = await fetch(url);
    console.log("response", response);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching client logos");
  }
}

export async function getActiveClientLogos(): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/client-logos/active`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET" });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching active client logos");
  }
}

export async function getClientLogoById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/client-logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", id });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching client logo");
  }
}

export async function updateClientLogo(
  id: string,
  formData: Partial<ClientLogoFormData>
): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/client-logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      id,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating client logo");
  }
}

export async function deleteClientLogo(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Client logo ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/client-logos/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", id });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting client logo");
  }
}

export async function reorderClientLogos(
  updates: ReorderRequest
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/client-logos/reorder`;
    console.log(`🚀 API Request - ${url}:`, { method: "PUT", body: updates });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "reordering client logos");
  }
}

// ===== FOOTER API FUNCTIONS =====
export async function getFooter(): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/footer`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET" });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching footer");
  }
}

export async function updateFooter(
  formData: FooterFormData
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/footer`;
    console.log(`🚀 API Request - ${url}:`, { method: "PUT", body: formData });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating footer");
  }
}

export async function updateContactInfo(
  formData: ContactInfoFormData
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/footer/contact-info`;
    console.log(`🚀 API Request - ${url}:`, { method: "PUT", body: formData });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating contact info");
  }
}

// ===== FOOTER SECTION API FUNCTIONS =====
export async function addFooterSection(
  formData: FooterSectionFormData
): Promise<ContentResponse> {
  if (!formData.title?.trim()) {
    return { success: false, message: "Footer section title is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/footer/sections`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "adding footer section");
  }
}

export async function updateFooterSection(
  sectionId: string,
  formData: Partial<FooterSectionFormData>
): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/footer/sections/${sectionId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      sectionId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating footer section");
  }
}

export async function deleteFooterSection(
  sectionId: string
): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }

  console.log("sectionId", sectionId);
  try {
    const url = `${getBackendUrl()}/content/footer/sections/${sectionId}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", sectionId });

    const response = await fetch(url, {
      method: "DELETE",
    });

    const result = await handleApiResponse(response, url);
    console.log("result", result);

    return result;
  } catch (error) {
    return handleApiError(error, "deleting footer section");
  }
}

// ===== FOOTER LINK API FUNCTIONS =====
export async function addFooterLink(
  sectionId: string,
  formData: FooterLinkFormData
): Promise<ContentResponse> {
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
    const url = `${getBackendUrl()}/content/footer/sections/${sectionId}/links`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "POST",
      sectionId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "adding footer link");
  }
}

export async function updateFooterLink(
  sectionId: string,
  linkId: string,
  formData: Partial<FooterLinkFormData>
): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }
  if (!linkId) {
    return { success: false, message: "Footer link ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/footer/sections/${sectionId}/links/${linkId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      sectionId,
      linkId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating footer link");
  }
}

export async function deleteFooterLink(
  sectionId: string,
  linkId: string
): Promise<ContentResponse> {
  if (!sectionId) {
    return { success: false, message: "Footer section ID is required." };
  }
  if (!linkId) {
    return { success: false, message: "Footer link ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/footer/sections/${sectionId}/links/${linkId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "DELETE",
      sectionId,
      linkId,
    });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting footer link");
  }
}

// ===== NAVBAR FUNCTIONS =====

export async function getNavbar(): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/navbar`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET" });

    const response = await fetch(url, {
      method: "GET",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching navbar");
  }
}

// Cached function for fetching navbar data with ISR
const fetchNavbarData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(`${getBackendUrl()}/content/navbar`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching navbar data:", error);
      return null;
    }
  },
  ["navbar"],
  {
    tags: [CONTENT_ISR_TAGS.NAVBAR, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching navbar data (ISR-enabled)
export async function getNavbarISR(): Promise<ContentResponse> {
  try {
    const data = await fetchNavbarData();
    return {
      success: true,
      message: "Navbar data fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching navbar for ISR");
  }
}

export async function updateNavbar(
  formData: NavbarFormData
): Promise<ContentResponse> {
  try {
    const url = `${getBackendUrl()}/content/navbar`;
    console.log(`🚀 API Request - ${url}:`, { method: "PUT", body: formData });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating navbar");
  }
}

export async function addNavbarMenu(
  formData: NavbarMenuFormData
): Promise<ContentResponse> {
  if (!formData.label?.trim()) {
    return { success: false, message: "Menu label is required." };
  }
  if (!formData.type) {
    return { success: false, message: "Menu type is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "adding navbar menu");
  }
}

export async function updateNavbarMenu(
  menuId: number,
  formData: Partial<NavbarMenuFormData>
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      menuId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating navbar menu");
  }
}

export async function deleteNavbarMenu(
  menuId: number
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", menuId });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting navbar menu");
  }
}

export async function addNavbarMenuItem(
  menuId: number,
  formData: NavbarMenuItemFormData
): Promise<ContentResponse> {
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
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}/items`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "POST",
      menuId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "adding navbar menu item");
  }
}

export async function updateNavbarMenuItem(
  menuId: number,
  menuItemId: number,
  formData: Partial<NavbarMenuItemFormData>
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!menuItemId) {
    return { success: false, message: "Menu item ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}/items/${menuItemId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      menuId,
      menuItemId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating navbar menu item");
  }
}

export async function deleteNavbarMenuItem(
  menuId: number,
  menuItemId: number
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!menuItemId) {
    return { success: false, message: "Menu item ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}/items/${menuItemId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "DELETE",
      menuId,
      menuItemId,
    });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting navbar menu item");
  }
}

export async function reorderNavbarMenus(
  updates: ReorderRequest[]
): Promise<ContentResponse> {
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/reorder`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      body: { updates },
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "reordering navbar menus");
  }
}

export async function reorderNavbarMenuItems(
  menuId: number,
  updates: ReorderRequest[]
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/navbar/menus/${menuId}/items/reorder`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      menuId,
      body: { updates },
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "reordering navbar menu items");
  }
}

// ===== DYNAMIC MENU API FUNCTIONS =====
export async function createDynamicMenu(
  formData: DynamicMenuFormData
): Promise<ContentResponse> {
  if (!formData.name?.trim()) {
    return { success: false, message: "Menu name is required." };
  }
  if (!formData.slug?.trim()) {
    return { success: false, message: "Menu slug is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus`;
    console.log(`🚀 API Request - ${url}:`, { method: "POST", body: formData });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "creating dynamic menu");
  }
}

export async function getDynamicMenus(
  filters: DynamicMenuFilters = {}
): Promise<ContentResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined)
      queryParams.append("isActive", filters.isActive.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `${getBackendUrl()}/content/dynamic-menus?${queryParams.toString()}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", filters });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menus");
  }
}

export async function getDynamicMenuById(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", id });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menu");
  }
}

export async function getDynamicMenuBySlug(
  slug: string
): Promise<ContentResponse> {
  if (!slug) {
    return { success: false, message: "Menu slug is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/slug/${slug}`;
    console.log(`🚀 API Request - ${url}:`, { method: "GET", slug });

    const response = await fetch(url);
    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "fetching dynamic menu by slug");
  }
}

export async function updateDynamicMenu(
  id: string,
  formData: Partial<DynamicMenuFormData>
): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${id}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      id,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating dynamic menu");
  }
}

export async function deleteDynamicMenu(id: string): Promise<ContentResponse> {
  if (!id) {
    return { success: false, message: "Menu ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${id}`;
    console.log(`🚀 API Request - ${url}:`, { method: "DELETE", id });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting dynamic menu");
  }
}

// ===== DYNAMIC MENU ITEM API FUNCTIONS =====
export async function createDynamicMenuItem(
  menuId: string,
  formData: DynamicMenuItemFormData
): Promise<ContentResponse> {
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
    const url = `${getBackendUrl()}/content/dynamic-menus/${menuId}/items`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "POST",
      menuId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "creating dynamic menu item");
  }
}

export async function updateDynamicMenuItem(
  menuId: string,
  itemId: number,
  formData: Partial<DynamicMenuItemFormData>
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!itemId) {
    return { success: false, message: "Item ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${menuId}/items/${itemId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PUT",
      menuId,
      itemId,
      body: formData,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "updating dynamic menu item");
  }
}

export async function deleteDynamicMenuItem(
  menuId: string,
  itemId: number
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!itemId) {
    return { success: false, message: "Item ID is required." };
  }

  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${menuId}/items/${itemId}`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "DELETE",
      menuId,
      itemId,
    });

    const response = await fetch(url, {
      method: "DELETE",
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "deleting dynamic menu item");
  }
}

export async function reorderDynamicMenuItems(
  menuId: string,
  updates: ReorderRequest[]
): Promise<ContentResponse> {
  if (!menuId) {
    return { success: false, message: "Menu ID is required." };
  }
  if (!updates || updates.length === 0) {
    return { success: false, message: "Updates array is required." };
  }

  console.log("updates", updates);
  try {
    const url = `${getBackendUrl()}/content/dynamic-menus/${menuId}/items/reorder`;
    console.log(`🚀 API Request - ${url}:`, {
      method: "PATCH",
      menuId,
      body: { updates },
    });

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    return await handleApiResponse(response, url);
  } catch (error) {
    return handleApiError(error, "reordering dynamic menu items");
  }
}

// ===== ISR-COMPATIBLE SERVER ACTIONS =====

// Cached function for fetching active dynamic menus with ISR
const fetchActiveDynamicMenusData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/dynamic-menus?isActive=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching active dynamic menus data:", error);
      return [];
    }
  },
  ["dynamic-menus-active"],
  {
    tags: [CONTENT_ISR_TAGS.DYNAMIC_MENUS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching active dynamic menus (ISR-enabled)
export async function getActiveDynamicMenusISR(): Promise<ContentResponse> {
  try {
    const data = await fetchActiveDynamicMenusData();

    return {
      success: true,
      message: "Active dynamic menus fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching active dynamic menus for ISR");
  }
}

// Cached function for fetching all dynamic menus with ISR
const fetchAllDynamicMenusData = unstable_cache(
  async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ menus: any[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());

      const url = `${getBackendUrl()}/content/dynamic-menus${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          menus: data.data || [],
          pagination: data.pagination || {
            total: data.data?.length || 0,
            page: params?.page || 1,
            totalPages: 1,
          },
        };
      }
      return { menus: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch (error) {
      console.error("Error fetching all dynamic menus data:", error);
      return { menus: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  },
  ["all-dynamic-menus"],
  {
    tags: [CONTENT_ISR_TAGS.DYNAMIC_MENUS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching all dynamic menus with ISR
export async function getAllDynamicMenusISR(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<ContentResponse> {
  try {
    const data = await fetchAllDynamicMenusData(params);

    return {
      success: true,
      message: "Dynamic menus fetched successfully",
      data: data.menus,
      pagination: data.pagination,
    };
  } catch (error) {
    return handleApiError(error, "fetching all dynamic menus for ISR");
  }
}

// Cached function for fetching single dynamic menu with ISR
const fetchSingleDynamicMenuData = unstable_cache(
  async (menuId: string): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/dynamic-menus/${menuId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching single dynamic menu data:", error);
      return null;
    }
  },
  ["single-dynamic-menu"],
  {
    tags: [CONTENT_ISR_TAGS.DYNAMIC_MENUS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching single dynamic menu with ISR
export async function getSingleDynamicMenuISR(
  menuId: string
): Promise<ContentResponse> {
  try {
    const data = await fetchSingleDynamicMenuData(menuId);

    if (data) {
      return {
        success: true,
        message: "Dynamic menu fetched successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: "Dynamic menu not found",
      };
    }
  } catch (error) {
    return handleApiError(error, "fetching single dynamic menu for ISR");
  }
}

// Cached function for fetching active logo with ISR
const fetchActiveLogoData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/logos/active/main`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching active logo data:", error);
      return null;
    }
  },
  ["logo-active-main"],
  {
    tags: [CONTENT_ISR_TAGS.LOGO, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching active logo (ISR-enabled)
export async function getActiveLogoISR(): Promise<ContentResponse> {
  try {
    const data = await fetchActiveLogoData();

    return {
      success: true,
      message: "Active logo fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching active logo for ISR");
  }
}

// Cached function for fetching active hero sections with ISR
const fetchActiveHeroSectionsData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/hero-sections/active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching active hero sections data:", error);
      return [];
    }
  },
  ["hero-sections-active"],
  {
    tags: [CONTENT_ISR_TAGS.HERO_SECTIONS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching active hero sections (ISR-enabled)
export async function getActiveHeroSectionsISR(): Promise<ContentResponse> {
  try {
    const data = await fetchActiveHeroSectionsData();

    return {
      success: true,
      message: "Active hero sections fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching active hero sections for ISR");
  }
}

// Cached function for fetching active client logos with ISR
const fetchActiveClientLogosData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/content/client-logos/active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching active client logos data:", error);
      return [];
    }
  },
  ["client-logos-active"],
  {
    tags: [CONTENT_ISR_TAGS.CLIENT_LOGOS, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching active client logos (ISR-enabled)
export async function getActiveClientLogosISR(): Promise<ContentResponse> {
  try {
    const data = await fetchActiveClientLogosData();

    return {
      success: true,
      message: "Active client logos fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching active client logos for ISR");
  }
}

// Cached function for fetching all logos with ISR
async function fetchAllLogosData(params?: {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
}): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${getBackendUrl()}/content/logos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: false,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logos: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching logos data:", error);
    throw error;
  }
}

// Server action for fetching all logos (ISR-enabled)
export async function getAllLogosISR(params?: {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
}): Promise<ContentResponse> {
  return await unstable_cache(
    () => fetchAllLogosData(params),
    [`logos-${JSON.stringify(params)}`],
    {
      tags: [CONTENT_ISR_TAGS.LOGO],
    }
  )();
}

// Cached function for fetching single logo with ISR
async function fetchSingleLogoData(id: string): Promise<any> {
  try {
    const response = await fetch(`${getBackendUrl()}/content/logos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: false,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching single logo data:", error);
    throw error;
  }
}

// Server action for fetching single logo (ISR-enabled)
export async function getSingleLogoISR(id: string): Promise<ContentResponse> {
  return await unstable_cache(() => fetchSingleLogoData(id), [`logo-${id}`], {
    tags: [CONTENT_ISR_TAGS.LOGO],
  })();
}

// Cached function for fetching footer data with ISR
const fetchFooterData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(`${getBackendUrl()}/content/footer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching footer data:", error);
      return null;
    }
  },
  ["footer-data"],
  {
    tags: [CONTENT_ISR_TAGS.FOOTER, CONTENT_ISR_TAGS.CONTENT],
  }
);

// Server action for fetching footer data (ISR-enabled)
export async function getFooterISR(): Promise<ContentResponse> {
  try {
    const data = await fetchFooterData();

    return {
      success: true,
      message: "Footer data fetched successfully",
      data,
    };
  } catch (error) {
    return handleApiError(error, "fetching footer for ISR");
  }
}
