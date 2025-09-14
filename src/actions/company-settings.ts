"use server";

import { unstable_cache } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";
import { revalidateTag } from "next/cache";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000"
  );
};

// ===== TYPES =====

export interface CompanySettings {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyLogo: string;
  companyDescription: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettingsResponse {
  success: boolean;
  message: string;
  data?: CompanySettings;
}

export interface CompanySettingsError {
  success: false;
  message: string;
  error?: string;
}

// ===== CACHED FETCH FUNCTIONS =====

// Cached function for fetching company settings with ISR
const fetchCompanySettingsData = unstable_cache(
  async (): Promise<CompanySettingsResponse> => {
    try {
      const response = await fetch(`${getBackendUrl()}/company-setting/get-setting`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || "Company settings fetched successfully",
          data: data.data,
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch company settings",
        };
      }
    } catch (error) {
      console.error("Error fetching company settings:", error);
      return {
        success: false,
        message: "Failed to fetch company settings",
      };
    }
  },
  ["company-settings"],
  {
    tags: [ISR_TAGS.COMPANY_SETTINGS],
    revalidate: 300, // 5 minutes
  }
);

// ===== PUBLIC API FUNCTIONS =====

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const result = await fetchCompanySettingsData();
    return result.data || null;
  } catch (error) {
    console.error("Error in getCompanySettings:", error);
    return null;
  }
}

export async function updateCompanySettings(settingsData: Partial<CompanySettings>): Promise<CompanySettingsResponse | CompanySettingsError> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/company-setting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settingsData),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Revalidate company settings cache
      await revalidateCompanySettings();
      return {
        success: true,
        message: data.message || "Company settings updated successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update company settings",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error updating company settings:", error);
    return {
      success: false,
      message: "Failed to update company settings",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===== REVALIDATION FUNCTIONS =====

export async function revalidateCompanySettings() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COMPANY_SETTINGS);
    console.log("✅ Company settings cache revalidated");
    return {
      success: true,
      message: "Company settings cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating company settings:", error);
    return { success: false, message: "Failed to revalidate company settings cache" };
  }
}
