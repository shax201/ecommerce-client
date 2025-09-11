"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getActiveClientLogos, ContentResponse } from "@/actions/content";

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

const Brands = () => {
  const [brands, setBrands] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: ContentResponse = await getActiveClientLogos();
        
        if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Sort by order field if available
          const sortedBrands = response.data.sort((a: ClientLogo, b: ClientLogo) => 
            (a.order || 0) - (b.order || 0)
          );
          setBrands(sortedBrands);
        } else if (response.success && response.data && Array.isArray(response.data) && response.data.length === 0) {
          // API succeeded but returned empty array - no brands in database
          setBrands([]);
        } else {
        
        }
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

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
        <div className="text-center text-gray-400 text-sm py-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default Brands;
