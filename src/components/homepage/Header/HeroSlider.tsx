"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { getActiveHeroSections, ContentResponse } from "@/actions/content";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import * as motion from "framer-motion/client";

interface HeroSection {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive: boolean;
  order: number;
}

interface HeroSliderProps {
  heroSections?: HeroSection[];
}

const HeroSlider = ({ heroSections: serverHeroSections }: HeroSliderProps) => {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use server-side data if available, otherwise fetch client-side
  useEffect(() => {
    if (serverHeroSections && serverHeroSections.length > 0) {
      // Use server-side data
      const sortedSections = serverHeroSections.sort(
        (a: HeroSection, b: HeroSection) => (a.order || 0) - (b.order || 0)
      );
      setHeroSections(sortedSections);
      setLoading(false);
    } else {
      // Fallback to client-side fetching if no server data
      const fetchHeroSections = async () => {
        try {
          setLoading(true);
          setError(null);

          const response: ContentResponse = await getActiveHeroSections();

          if (
            response.success &&
            response.data &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            // Sort by order field if available
            const sortedSections = response.data.sort(
              (a: HeroSection, b: HeroSection) =>
                (a.order || 0) - (b.order || 0)
            );
            setHeroSections(sortedSections);
          } else {
            setHeroSections([]);
          }
        } catch (err) {
          console.error("Error fetching hero sections:", err);
          setError("Failed to load hero sections");
          setHeroSections([]);
        } finally {
          setLoading(false);
        }
      };

      fetchHeroSections();
    }
  }, [serverHeroSections]);

  // Auto-play functionality
  useEffect(() => {
    if (heroSections.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSections.length);
    }, 20000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [heroSections.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Don't render if still loading or no data
  if (loading) {
    return (
      <header className="bg-[#F2F0F1] pt-10 md:pt-24 overflow-hidden">
        <div className="md:max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <section className="max-w-frame px-4">
            <div className="h-16 lg:h-20 bg-gray-300 animate-pulse rounded mb-5 lg:mb-8"></div>
            <div className="h-4 lg:h-5 bg-gray-300 animate-pulse rounded mb-6 lg:mb-8 max-w-[545px]"></div>
            <div className="h-12 bg-gray-300 animate-pulse rounded mb-5 md:mb-12 w-52"></div>
          </section>
          <section className="relative md:px-4 min-h-[448px] md:min-h-[428px] bg-gray-300 animate-pulse"></section>
        </div>
      </header>
    );
  }

  if (!heroSections || heroSections.length === 0) {
    return null;
  }

  const currentHero = heroSections[currentSlide];

  return (
    <header className="bg-[#F2F0F1] pt-10 md:pt-24 overflow-hidden relative">
      {/* Slider Container */}
      <div className="md:max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <section className="max-w-frame px-4">
          <motion.h2
            key={`title-${currentSlide}`}
            initial={{ y: "100px", opacity: 0, rotate: 10 }}
            animate={{ y: "0", opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6 }}
            className={cn([
              integralCF.className,
              "text-4xl lg:text-[64px] lg:leading-[64px] mb-5 lg:mb-8",
            ])}
          >
            {currentHero.title}
          </motion.h2>

          {currentHero.subtitle && (
            <motion.h3
              key={`subtitle-${currentSlide}`}
              initial={{ y: "100px", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl lg:text-3xl font-semibold mb-3 lg:mb-4"
            >
              {currentHero.subtitle}
            </motion.h3>
          )}

          <motion.p
            key={`description-${currentSlide}`}
            initial={{ y: "100px", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-black/60 text-sm lg:text-base mb-6 lg:mb-8 max-w-[545px]"
          >
            {currentHero.description ||
              "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style."}
          </motion.p>

          <motion.div
            key={`buttons-${currentSlide}`}
            initial={{ y: "100px", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {currentHero.primaryButtonText && currentHero.primaryButtonLink && (
              <Link
                href={currentHero.primaryButtonLink}
                className="w-full sm:w-auto text-center bg-black hover:bg-black/80 transition-all text-white px-14 py-4 rounded-full hover:animate-pulse"
              >
                {currentHero.primaryButtonText}
              </Link>
            )}
            {currentHero.secondaryButtonText &&
              currentHero.secondaryButtonLink && (
                <Link
                  href={currentHero.secondaryButtonLink}
                  className="w-full sm:w-auto text-center border-2 border-black hover:bg-black hover:text-white transition-all text-black px-14 py-4 rounded-full"
                >
                  {currentHero.secondaryButtonText}
                </Link>
              )}
          </motion.div>

          <motion.div
            key={`stats-${currentSlide}`}
            initial={{ y: "100px", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex md:h-full md:max-h-11 lg:max-h-[52px] xl:max-h-[68px] items-center justify-center md:justify-start flex-wrap sm:flex-nowrap md:space-x-3 lg:space-x-6 xl:space-x-8 md:mb-[116px] mt-8"
          >
            <div className="flex flex-col">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
                <AnimatedCounter from={0} to={200} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap">
                International Brands
              </span>
            </div>
            <Separator
              className="ml-6 md:ml-0 h-12 md:h-full bg-black/10"
              orientation="vertical"
            />
            <div className="flex flex-col ml-6 md:ml-0">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
                <AnimatedCounter from={0} to={2000} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap">
                High-Quality Products
              </span>
            </div>
            <Separator
              className="hidden sm:block sm:h-12 md:h-full ml-6 md:ml-0 bg-black/10"
              orientation="vertical"
            />
            <div className="flex flex-col w-full text-center sm:w-auto sm:text-left mt-3 sm:mt-0 sm:ml-6 md:ml-0">
              <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
                <AnimatedCounter from={0} to={3000} />+
              </span>
              <span className="text-xs xl:text-base text-black/60 text-nowrap">
                Happy Customers
              </span>
            </div>
          </motion.div>
        </section>

        <motion.section
          key={`image-${currentSlide}`}
          initial={{ y: "100px", opacity: 0, rotate: 10 }}
          animate={{ y: "0", opacity: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative md:px-4 min-h-[448px] md:min-h-[428px] bg-cover bg-top xl:bg-[center_top_-1.6rem] bg-no-repeat"
          style={{
            backgroundImage: currentHero.backgroundImage
              ? `url('${currentHero.backgroundImage}')`
              : "url('/images/header-res-homepage.png')",
          }}
        >
          <Image
            priority
            src="/icons/big-star.svg"
            height={104}
            width={104}
            alt="big star"
            className="absolute right-7 xl:right-0 top-12 max-w-[76px] max-h-[76px] lg:max-w-24 lg:max-h-max-w-24 xl:max-w-[104px] xl:max-h-[104px] animate-[spin_4s_infinite]"
          />
          <Image
            priority
            src="/icons/small-star.svg"
            height={56}
            width={56}
            alt="small star"
            className="absolute left-7 md:left-0 top-36 sm:top-64 md:top-44 lg:top-56 max-w-11 max-h-11 md:max-w-14 md:max-h-14 animate-[spin_3s_infinite]"
          />
        </motion.section>
      </div>

      {/* Navigation Controls */}
      {heroSections.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-black scale-125"
                  : "bg-black/30 hover:bg-black/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </header>
  );
};

export default HeroSlider;
