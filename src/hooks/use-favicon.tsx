"use client";

import { useState, useEffect } from 'react';
import { getActiveLogosByType } from '@/actions/content';

export interface Favicon {
  _id: string;
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'favicon';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useFavicon() {
  const [favicon, setFavicon] = useState<Favicon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching favicon...');
        const response = await getActiveLogosByType('favicon');
        console.log('📡 Favicon response:', response);
        
        if (response.success && response.data) {
          console.log('✅ Favicon loaded successfully:', response.data);
          setFavicon(response.data);
          
          // Update the favicon in the DOM
          updateFaviconInDOM(response.data.url, response.data.altText);
        } else {
          console.log('❌ Failed to fetch favicon:', response.message);
          setError(response.message || 'Failed to fetch favicon');
        }
      } catch (err) {
        console.error('❌ Error fetching favicon:', err);
        setError('An error occurred while fetching favicon');
      } finally {
        setLoading(false);
      }
    };

    fetchFavicon();
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
  };

  // Function to manually update favicon (useful for admin changes)
  const updateFavicon = async (url: string, altText?: string) => {
    updateFaviconInDOM(url, altText);
  };

  return { favicon, loading, error, updateFavicon };
}
