"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/store";
import { useGetLogosQuery } from "@/lib/features/logos/logosApi";
import { selectFavicon } from "@/lib/features/logos/logosSlice";

export default function FaviconProvider() {
  // Get favicon from Redux store
  const favicon = useAppSelector(selectFavicon);
  
  // Fetch logos data
  useGetLogosQuery();

  // Function to update the favicon in the DOM
  const updateFaviconInDOM = (url: string, altText?: string) => {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    link.type = 'image/x-icon';
    if (altText) {
      link.setAttribute('alt', altText);
    }
    
    document.head.appendChild(link);

    // Also update apple-touch-icon for iOS devices
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', url);
    } else {
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);
    }
  };

  // Update DOM when favicon changes
  useEffect(() => {
    if (favicon?.url) {
      updateFaviconInDOM(favicon.url, favicon.altText);
    }
  }, [favicon]);

  return null;
}
