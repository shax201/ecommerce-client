"use client";

import React from "react";
import Image from "next/image";
import { useBrandsISR } from "@/hooks/use-brands-isr";

// Fallback data in case API fails
const fallbackBrandsData: { id: string; srcUrl: string; altText: string }[] = [
  {
    id: "versace",
    srcUrl: "/icons/versace-logo.svg",
    altText: "Versace Logo",
  },
  {
    id: "zara",
    srcUrl: "/icons/zara-logo.svg",
    altText: "Zara Logo",
  },
  {
    id: "gucci",
    srcUrl: "/icons/gucci-logo.svg",
    altText: "Gucci Logo",
  },
  {
    id: "prada",
    srcUrl: "/icons/prada-logo.svg",
    altText: "Prada Logo",
  },
  {
    id: "calvin-klein",
    srcUrl: "/icons/calvin-klein-logo.svg",
    altText: "Calvin Klein Logo",
  },
];

interface ClientLogo {
  _id: string;
  name: string;
  logoUrl: string;
  altText: string;
  order: number;
}

interface BrandsProps {
  clientLogos?: any[];
}

const Brands = ({ clientLogos }: BrandsProps) => {
  // Use the custom ISR hook for better data management
  const { brands, loading, error, dataSource, performanceMetrics } =
    useBrandsISR({ clientLogos });

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Brands ISR Debug:", {
      loading,
      error,
      brandsCount: brands.length,
      dataSource,
      performanceMetrics,
    });
  }

  // Don't render anything if still loading
  if (loading) {
    return null;
  }

  // Don't render if no brands data (neither from API nor fallback)
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="bg-black">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 space-x-7">
        {brands.map((brand) => (
          <Image
            key={brand._id}
            priority
            src={brand.logoUrl}
            height={0}
            width={0}
            alt={brand.altText || brand.name}
            className="h-auto w-auto max-w-[116px] lg:max-w-48 max-h-[26px] lg:max-h-9 my-5 md:my-11"
          />
        ))}
      </div>
      {error && (
        <div className="text-center text-gray-400 text-sm py-2">{error}</div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Brands, (prevProps, nextProps) => {
  // Only re-render if the actual data has changed
  const clientLogosChanged =
    JSON.stringify(prevProps.clientLogos) !==
    JSON.stringify(nextProps.clientLogos);

  return !clientLogosChanged;
});
