"use client";

import { useEffect } from 'react';
import { getActiveLogosByType } from '@/actions/content';

/**
 * Direct API call component for favicon loading
 * This component calls the API directly and updates the favicon
 */
export default function FaviconLoader() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        console.log('🔄 Loading favicon from API...');
        
        // Call the API directly
        const response = await getActiveLogosByType('favicon');
        console.log('📡 Favicon API response:', response);
        
        if (response.success && response.data) {
          console.log('✅ Favicon loaded successfully:', response.data);
          
          // Update the favicon in the DOM
          updateFaviconInDOM(response.data.url, response.data.altText);
        } else {
          console.log('❌ No favicon found or API error:', response.message);
          // You can set a default favicon here if needed
          // updateFaviconInDOM('/default-favicon.ico', 'Default Favicon');
        }
      } catch (error) {
        console.error('❌ Error loading favicon:', error);
        // Handle error - you could set a fallback favicon here
      }
    };

    // Call the API when component mounts
    loadFavicon();
  }, []);

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

    console.log('🎯 Favicon updated in DOM:', url);
  };

  // This component doesn't render anything visible
  return null;
}
