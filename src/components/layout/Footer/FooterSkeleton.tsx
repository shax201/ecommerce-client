"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";

const FooterSkeleton = () => {
  return (
    <footer className="mt-10">
      <div className="relative">
        <div className="absolute bottom-0 w-full h-1/2 bg-[#F0F0F0]"></div>
        <div className="px-4">
          {/* Newsletter Section Skeleton */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-black rounded-[20px]">
            <div className="animate-pulse">
              <div className="h-8 md:h-10 bg-gray-700 rounded mb-9 md:mb-0"></div>
            </div>
            <div className="flex items-center">
              <div className="flex flex-col max-w-[349px] mx-auto w-full">
                <div className="animate-pulse bg-gray-700 h-12 rounded mb-[14px]"></div>
                <div className="animate-pulse bg-gray-700 h-12 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 md:pt-[50px] bg-[#F0F0F0] px-4 pb-4">
        <div className="max-w-frame mx-auto">
          <nav className="lg:grid lg:grid-cols-12 mb-8">
            <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
              {/* Logo Skeleton */}
              <div className="animate-pulse">
                <div className={cn([
                  integralCF.className,
                  "h-8 lg:h-9 bg-gray-400 rounded mb-6 w-32"
                ])}></div>
              </div>
              
              {/* Description Skeleton */}
              <div className="animate-pulse">
                <div className="h-4 bg-gray-400 rounded mb-2"></div>
                <div className="h-4 bg-gray-400 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-400 rounded mb-9 w-1/2"></div>
              </div>
              
              {/* Social Media Skeleton */}
              <div className="flex items-center">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-300 mr-3 w-7 h-7 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Links Skeleton */}
            <div className="hidden lg:grid col-span-9 lg:grid-cols-4 lg:pl-10">
              {[1, 2, 3, 4].map((section) => (
                <section className="flex flex-col mt-5" key={section}>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-400 rounded mb-6 w-20"></div>
                  </div>
                  {[1, 2, 3, 4].map((link) => (
                    <div
                      key={link}
                      className="animate-pulse h-4 bg-gray-400 rounded mb-4 w-24"
                    ></div>
                  ))}
                </section>
              ))}
            </div>
            
            <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4">
              {[1, 2, 3, 4].map((section) => (
                <section className="flex flex-col mt-5" key={section}>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-400 rounded mb-6 w-20"></div>
                  </div>
                  {[1, 2, 3, 4].map((link) => (
                    <div
                      key={link}
                      className="animate-pulse h-4 bg-gray-400 rounded mb-4 w-24"
                    ></div>
                  ))}
                </section>
              ))}
            </div>
          </nav>

          <hr className="h-[1px] border-t-black/10 mb-6" />
          
          {/* Copyright and Payment Skeleton */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-2">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-400 rounded mb-4 sm:mb-0 sm:mr-1 w-64"></div>
            </div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-[46px] h-[30px] rounded-[5px] border-[#D6DCE5] bg-gray-300 flex items-center justify-center mr-3 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSkeleton;
