import React from "react";
import HomePage from "./(frontend)/home";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import TopBanner from "@/components/layout/Banner/TopBanner";
import Footer from "@/components/layout/Footer";
import {
  getNewArrivals,
  getTopSellingProducts,
} from "@/actions/products";
import { getCompanySettings } from "@/actions/company-settings";
import {
  getActiveDynamicMenusISR,
  getActiveLogoISR,
  getActiveHeroSectionsISR,
  getActiveClientLogosISR,
  getFooterISR,
} from "@/actions/content";
import { Product } from "@/types/product.types";
import { HeroSectionFormData, ClientLogoFormData } from "@/actions/content";
import { DynamicMenu } from "@/hooks/use-dynamic-menus";
import { Logo } from "@/hooks/use-logo";
import {
  extractISRData,
  getFallbackData,
  logISRError,
  measureISRPerformance,
} from "@/lib/isr-utils";

// Types for page props
interface HomePageProps {
  newArrivals: Product[];
  topSellingProducts: Product[];
  dynamicMenus: DynamicMenu[];
  logo: Logo | null;
  heroSections: HeroSectionFormData[];
  clientLogos: ClientLogoFormData[];
  footerData: any;
  companySettings: any;
}

interface HomeProps {
  newArrivals: Product[];
  topSellingProducts: Product[];
  dynamicMenus: DynamicMenu[];
  logo: Logo | null;
  heroSections: HeroSectionFormData[];
  clientLogos: ClientLogoFormData[];
  footerData: any;
  companySettings: any;
}

interface HomePageProps {
  newArrivals: Product[];
  topSellingProducts: Product[];
  dynamicMenus: DynamicMenu[];
  logo: Logo | null;
  heroSections: HeroSectionFormData[];
  clientLogos: ClientLogoFormData[];
  footerData: any;
  companySettings: any;
}

export default async function Home() {
  // Fetch data at build time
  const props = await getHomePageData();

  // console.log('props', props)

  return (
    <>
      <TopBanner heroSections={props.heroSections} />
      <TopNavbar dynamicMenus={props.dynamicMenus} logo={props.logo} />
      <HomePage
        newArrivals={props.newArrivals}
        topSellingProducts={props.topSellingProducts}
        companySettings={props.companySettings}
        heroSections={props.heroSections}
        clientLogos={props.clientLogos}
      />
      <Footer footerData={props.footerData} clientLogos={props.clientLogos} />
    </>
  );
}

// ISR configuration for App Router
export const dynamic = "force-static";

// Generate static params (required for static generation)
export async function generateStaticParams() {
  return [{}]; // Only generate for the root page
}

// Server component that fetches data at build time
async function getHomePageData(): Promise<HomeProps> {
  try {
    // Fetch all data concurrently for better performance
    const [
      newArrivalsRes,
      topSellingRes,
      menusRes,
      logoRes,
      heroRes,
      clientLogosRes,
      footerRes,
      settingsRes,
    ] = await Promise.allSettled([
      getNewArrivals(),
      getTopSellingProducts(),
      getActiveDynamicMenusISR(),
      getActiveLogoISR(),
      getActiveHeroSectionsISR(),
      getActiveClientLogosISR(),
      getFooterISR(),
      getCompanySettings(),
    ]);

 


    // Extract data with utilities
    const isrData = extractISRData([
      newArrivalsRes,
      topSellingRes,
      menusRes,
      logoRes,
      heroRes,
      clientLogosRes,
      footerRes,
      settingsRes,
    ]);

    return isrData;
  } catch (error) {
    logISRError("generateStaticParams", error, "Home page ISR");

    // Return fallback data
    return getFallbackData();
  }
}
