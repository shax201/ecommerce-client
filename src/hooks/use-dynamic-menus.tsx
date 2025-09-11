"use client";

import { useState, useEffect } from 'react';
import { getDynamicMenus, DynamicMenuFormData } from '@/actions/content';

export interface DynamicMenuItem {
  id: number;
  label: string;
  url: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  isActive: boolean;
  order: number;
  parentId?: number;
  children?: DynamicMenuItem[];
}

export interface DynamicMenu {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  items: DynamicMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useDynamicMenus() {
  const [menus, setMenus] = useState<DynamicMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching dynamic menus...');
        const response = await getDynamicMenus({ isActive: true });
        console.log('📡 Dynamic menus response:', response);
        
        if (response.success && response.data) {
          console.log('✅ Dynamic menus loaded successfully:', response.data);
          setMenus(response.data);
        } else {
          console.log('❌ Failed to fetch dynamic menus:', response.message);
          setError(response.message || 'Failed to fetch menus');
        }
      } catch (err) {
        console.error('❌ Error fetching dynamic menus:', err);
        setError('An error occurred while fetching menus');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return { menus, loading, error };
}
