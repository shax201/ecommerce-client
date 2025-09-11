"use client";

import { useEffect } from 'react';

/**
 * Direct API call component that fetches favicon without using hooks
 * This is the most direct way to call the API in the root component
 */
export default function DirectFaviconLoader() {
  useEffect(() => {
    const loadFaviconFromAPI = async () => {
      try {
        console.log('🚀 Direct API call for favicon...');
        
        // Direct API call to your backend
        const response = await fetch('/api/content/logos/active/favicon');
        const data = await response.json();
        
        console.log('📡 Direct API response:', data);
        
        if (data.success && data.data) {
          console.log('✅ Favicon loaded via direct API call:', data.data);
          
          // Update favicon in DOM
          updateFaviconInDOM(data.data.url, data.data.altText);
        } else {
          console.log('❌ No favicon found via direct API call');
        }
      } catch (error) {
        console.error('❌ Error in direct API call:', error);
      }
    };

    // Call API immediately when component mounts
    loadFaviconFromAPI();
  }, []);

  // Function to update favicon in DOM
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

    // Update apple-touch-icon for iOS
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', url);
    } else {
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);
    }

    console.log('🎯 Favicon updated via direct API call:', url);
  };

  return null;
}
