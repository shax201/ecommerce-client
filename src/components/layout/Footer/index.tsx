"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import Link from "next/link";
import { PaymentBadge } from "./footer.types";
import LayoutSpacing from "./LayoutSpacing";
import LinksSection from "./LinksSection";
import NewsLetterSection from "./NewsLetterSection";
import SocialMediaSection from "./SocialMediaSection";
import FooterSkeleton from "./FooterSkeleton";
import { useFooterISR } from "@/hooks/use-footer-isr";

const paymentBadgesData: PaymentBadge[] = [
  {
    id: 1,
    srcUrl: "/icons/Visa.svg",
  },
  {
    id: 2,
    srcUrl: "/icons/mastercard.svg",
  },
  {
    id: 3,
    srcUrl: "/icons/paypal.svg",
  },
  {
    id: 4,
    srcUrl: "/icons/applePay.svg",
  },
  {
    id: 5,
    srcUrl: "/icons/googlePay.svg",
  },
];

interface FooterProps {
  footerData?: any;
  clientLogos?: any[];
}

const Footer = ({ footerData: serverFooterData, clientLogos }: FooterProps) => {
  // Use the custom ISR hook for better organization
  const {
    footerData,
    clientLogos: finalClientLogos,
    isLoading,
    hasError,
    dataSource,
  } = useFooterISR({ footerData: serverFooterData, clientLogos });

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Footer ISR Debug:", {
      isLoading,
      hasError,
      dataSource,
      hasFooterData: !!footerData,
      clientLogosCount: finalClientLogos?.length || 0,
      performanceMetrics: {
        hasServerData:
          dataSource.footerFromServer || dataSource.clientLogosFromServer,
        dataCompleteness: {
          hasFooterData: !!footerData,
          hasClientLogos: (finalClientLogos?.length ?? 0) > 0,
        },
      },
    });
  }

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <FooterSkeleton />;
  }

  // Show error state or fallback to static content
  if (hasError || !footerData) {
    console.error("Footer data error:", hasError);
    // Fallback to static content
    return (
      <footer className="mt-10">
        <div className="relative">
          <div className="absolute bottom-0 w-full h-1/2 bg-[#F0F0F0]"></div>
          <div className="px-4">
            <NewsLetterSection />
          </div>
        </div>
        <div className="pt-8 md:pt-[50px] bg-[#F0F0F0] px-4 pb-4">
          <div className="max-w-frame mx-auto">
            <nav className="lg:grid lg:grid-cols-12 mb-8">
              <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
                <h1
                  className={cn([
                    integralCF.className,
                    "text-[28px] lg:text-[32px] mb-6",
                  ])}
                >
                  shopper
                </h1>
                <p className="text-black/60 text-sm mb-9">
                  We have clothes that suits your style and which you're proud
                  to wear. From women to men.
                </p>
              </div>
            </nav>
            <hr className="h-[1px] border-t-black/10 mb-6" />
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-2">
              <p className="text-sm text-center sm:text-left text-black/60 mb-4 sm:mb-0 sm:mr-1">
                shopper © Made by{" "}
                <Link
                  href="https://github.com/xer-on"
                  className="text-black font-medium"
                >
                  Rifat Rahman
                </Link>
                {", "}
                Designed by{" "}
                <Link
                  href="https://github.com/xer-on"
                  className="text-black font-medium"
                >
                  Rifat Rahman
                </Link>
              </p>
            </div>
          </div>
          <LayoutSpacing />
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-10">
      <div className="relative">
        <div className="absolute bottom-0 w-full h-1/2 bg-[#F0F0F0]"></div>
        <div className="px-4">
          <NewsLetterSection />
        </div>
      </div>
      <div className="pt-8 md:pt-[50px] bg-[#F0F0F0] px-4 pb-4">
        <div className="max-w-frame mx-auto">
          <nav className="lg:grid lg:grid-cols-12 mb-8">
            <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
              {/* Dynamic Logo */}
              {footerData.logoUrl ? (
                <div className="mb-6">
                  <Image
                    src={footerData.logoUrl}
                    alt={footerData.logoAlt || "Company Logo"}
                    width={120}
                    height={40}
                    className="h-8 lg:h-10 w-auto"
                    priority
                  />
                </div>
              ) : (
                <h1
                  className={cn([
                    integralCF.className,
                    "text-[28px] lg:text-[32px] mb-6",
                  ])}
                >
                  shopper
                </h1>
              )}

              {/* Dynamic Description */}
              <p className="text-black/60 text-sm mb-9">
                {footerData.description ||
                  "We have clothes that suits your style and which you're proud to wear. From women to men."}
              </p>

              {/* Dynamic Social Media */}
              <SocialMediaSection contactInfo={footerData.contactInfo} />
            </div>

            {/* Dynamic Links */}
            <div className="hidden lg:grid col-span-9 lg:grid-cols-4 lg:pl-10">
              <LinksSection sections={footerData.sections} />
            </div>
            <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4">
              <LinksSection sections={footerData.sections} />
            </div>
          </nav>

          <hr className="h-[1px] border-t-black/10 mb-6" />
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-2">
            {/* Dynamic Copyright */}
            <p className="text-sm text-center sm:text-left text-black/60 mb-4 sm:mb-0 sm:mr-1">
              {footerData.copyright || (
                <>
                  shopper © Made by{" "}
                  <Link
                    href="https://github.com/xer-on"
                    className="text-black font-medium"
                  >
                    Rifat Rahman
                  </Link>
                  {", "}
                  Designed by{" "}
                  <Link
                    href="https://github.com/xer-on"
                    className="text-black font-medium"
                  >
                    Rifat Rahman
                  </Link>
                </>
              )}
            </p>

            {/* Payment Badges */}
            <div className="flex items-center">
              {paymentBadgesData.map((badge, _, arr) => (
                <span
                  key={badge.id}
                  className={cn([
                    arr.length !== badge.id && "mr-3",
                    "w-[46px] h-[30px] rounded-[5px] border-[#D6DCE5] bg-white flex items-center justify-center",
                  ])}
                >
                  <Image
                    priority
                    src={badge.srcUrl}
                    width={33}
                    height={100}
                    alt="payment method"
                    className="max-h-[15px]"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
        <LayoutSpacing />
      </div>
    </footer>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Footer, (prevProps, nextProps) => {
  // Only re-render if the actual data has changed
  const footerChanged =
    JSON.stringify(prevProps.footerData) !==
    JSON.stringify(nextProps.footerData);
  const clientLogosChanged =
    JSON.stringify(prevProps.clientLogos) !==
    JSON.stringify(nextProps.clientLogos);

  return !footerChanged && !clientLogosChanged;
});
