"use client";

import { useState, useEffect } from 'react';
import { getActiveLogosByType } from '@/actions/content';

export interface Logo {
  _id: string;
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useLogo() {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching main logo...');
        const response = await getActiveLogosByType('main');
        console.log('📡 Logo response:', response);
        
        if (response.success && response.data) {
          console.log('✅ Logo loaded successfully:', response.data);
          setLogo(response.data);
        } else {
          console.log('❌ Failed to fetch logo:', response.message);
          setError(response.message || 'Failed to fetch logo');
        }
      } catch (err) {
        console.error('❌ Error fetching logo:', err);
        setError('An error occurred while fetching logo');
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logo, loading, error };
}
