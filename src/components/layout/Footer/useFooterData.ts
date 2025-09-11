"use client";

import { useState, useEffect } from 'react';
import { FooterService } from '@/lib/services/content-service';
import { FooterData } from './footer.types';

export const useFooterData = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFooterData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await FooterService.get();
      
      if (response.success && response.data) {
        const footer = response.data;
        setFooterData({
          id: footer._id || footer.id,
          sections: footer.sections?.map((section: any) => ({
            id: section._id || section.id,
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link._id || link.id,
              title: link.title,
              url: link.url,
              isExternal: link.isExternal,
              isActive: link.isActive,
              order: link.order
            })) || [],
            isActive: section.isActive,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
          })) || [],
          contactInfo: footer.contactInfo || {
            email: '',
            phone: '',
            address: '',
            socialMedia: {}
          },
          copyright: footer.copyright || '',
          description: footer.description || '',
          logoUrl: footer.logoUrl || '',
          logoAlt: footer.logoAlt || '',
          createdAt: footer.createdAt,
          updatedAt: footer.updatedAt
        });
      } else {
        setError(response.message || 'Failed to load footer data');
      }
    } catch (err) {
      console.error('Error fetching footer data:', err);
      setError('Failed to load footer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  return { footerData, isLoading, error, refetch: fetchFooterData };
};
