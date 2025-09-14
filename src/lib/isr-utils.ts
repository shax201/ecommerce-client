// ISR Utilities for error handling and fallbacks

import { Product } from "@/types/product.types";
import { DynamicMenu } from "@/hooks/use-dynamic-menus";
import { Logo } from "@/hooks/use-logo";
import { HeroSectionFormData, ClientLogoFormData } from "@/actions/content";

export interface ISRData {
  newArrivals: Product[];
  topSellingProducts: Product[];
  dynamicMenus: DynamicMenu[];
  logo: Logo | null;
  heroSections: HeroSectionFormData[];
  clientLogos: ClientLogoFormData[];
  footerData: any;
  companySettings: any;
}

// Fallback data for ISR
export const getFallbackData = (): ISRData => ({
  newArrivals: [],
  topSellingProducts: [],
  dynamicMenus: [],
  logo: null,
  heroSections: [],
  clientLogos: [],
  footerData: null,
  companySettings: null,
});

// Error logging utility
export const logISRError = (
  operation: string,
  error: any,
  context?: string
) => {
  console.error(`ISR Error in ${operation}:`, {
    error: error.message || error,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Safe data extraction from Promise.allSettled results
export const extractISRData = (
  results: PromiseSettledResult<any>[]
): ISRData => {
  const [
    newArrivalsRes,
    topSellingRes,
    menusRes,
    logoRes,
    heroRes,
    clientLogosRes,
    footerRes,
    settingsRes,
  ] = results;

  return {
    newArrivals: extractData(newArrivalsRes, "newArrivals", []),
    topSellingProducts: extractData(topSellingRes, "topSellingProducts", []),
    dynamicMenus: extractData(menusRes, "dynamicMenus", []),
    logo: extractData(logoRes, "logo", null),
    heroSections: extractData(heroRes, "heroSections", []),
    clientLogos: extractData(clientLogosRes, "clientLogos", []),
    footerData: extractData(footerRes, "footerData", null),
    companySettings: extractData(settingsRes, "companySettings", null),
  };
};

// Helper function to safely extract data from settled promises
const extractData = <T>(
  result: PromiseSettledResult<any>,
  operation: string,
  fallback: T
): T => {
  if (result.status === "fulfilled") {
    // Check if the result has success/data structure
    if (result.value && typeof result.value === 'object' && 'success' in result.value) {
      if (result.value.success) {
        return result.value.data;
      } else {
        logISRError(operation, result.value.message || "Operation failed");
      }
    } else {
      // Direct array/object result (like from getNewArrivals, getTopSellingProducts)
      return result.value;
    }
  } else if (result.status === "rejected") {
    logISRError(operation, result.reason);
  }

  return fallback;
};

// Cache key generator for ISR
export const generateISRKey = (
  path: string,
  params?: Record<string, any>
): string => {
  const paramString = params ? `-${JSON.stringify(params)}` : "";
  return `isr-${path}${paramString}-${Date.now()}`;
};

// Revalidation time calculator
export const getRevalidationTime = (contentType: string): number => {
  const revalidationTimes = {
    products: 60, // 1 minute for frequently changing products
    menus: 300, // 5 minutes for menus
    logo: 300, // 5 minutes for logo
    hero: 300, // 5 minutes for hero sections
    footer: 600, // 10 minutes for footer
    settings: 300, // 5 minutes for settings
    "client-logos": 600, // 10 minutes for client logos
  };

  return revalidationTimes[contentType as keyof typeof revalidationTimes] || 60;
};

// Performance monitoring for ISR
export const measureISRPerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`ISR Performance: ${operation} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `ISR Performance Error: ${operation} failed after ${duration}ms`,
      error
    );
    throw error;
  }
};
