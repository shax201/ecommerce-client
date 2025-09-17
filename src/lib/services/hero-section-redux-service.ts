// Redux-based Hero Section Service
// This service provides Redux integration for hero section management

import { store } from '@/lib/store';
import { 
  useGetHeroSectionsQuery,
  useCreateHeroSectionMutation,
  useUpdateHeroSectionMutation,
  useDeleteHeroSectionMutation,
  useToggleHeroSectionStatusMutation,
  useReorderHeroSectionsMutation,
  useBulkDeleteHeroSectionsMutation,
  useBulkUpdateHeroSectionsMutation,
  type HeroSectionData,
  type CreateHeroSectionData,
  type UpdateHeroSectionData,
  type ReorderHeroSectionsData
} from '@/lib/features/hero-sections';
import { 
  setHeroSections, 
  addHeroSection, 
  updateHeroSection, 
  removeHeroSection,
  removeHeroSections,
  setLoading, 
  setError,
  selectHeroSection,
  deselectHeroSection,
  selectAllHeroSectionsAction,
  clearSelection,
  setBulkOperating,
  reorderHeroSections,
  bulkUpdateHeroSections
} from '@/lib/features/hero-sections';

// Redux-based hero section service
export const heroSectionReduxService = {
  // Get all hero sections using Redux query
  async getHeroSections(params?: { page?: number; limit?: number }): Promise<HeroSectionData[]> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      // This would typically be called from a component using the hook
      // For service usage, we'll use the legacy service as fallback
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.getAll(params);
      
      if (response.success && response.data) {
        store.dispatch(setHeroSections(response.data));
        store.dispatch(setLoading(false));
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch hero sections');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hero sections';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Create hero section using Redux mutation
  async createHeroSection(data: CreateHeroSectionData): Promise<HeroSectionData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.create(data);
      
      if (response.success && response.data) {
        store.dispatch(addHeroSection(response.data));
        store.dispatch(setLoading(false));
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create hero section');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create hero section';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Update hero section using Redux mutation
  async updateHeroSection(id: string, data: UpdateHeroSectionData): Promise<HeroSectionData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.update(id, data);
      
      if (response.success && response.data) {
        store.dispatch(updateHeroSection(response.data));
        store.dispatch(setLoading(false));
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update hero section');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hero section';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Delete hero section using Redux mutation
  async deleteHeroSection(id: string): Promise<void> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.delete(id);
      
      if (response.success) {
        store.dispatch(removeHeroSection(id));
        store.dispatch(setLoading(false));
      } else {
        throw new Error(response.message || 'Failed to delete hero section');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hero section';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Toggle hero section active status
  async toggleHeroSectionStatus(id: string, isActive: boolean): Promise<HeroSectionData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.update(id, { isActive });
      
      if (response.success && response.data) {
        store.dispatch(updateHeroSection(response.data));
        store.dispatch(setLoading(false));
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to toggle hero section status');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle hero section status';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Reorder hero sections
  async reorderHeroSections(data: ReorderHeroSectionsData): Promise<void> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const response = await HeroSectionService.reorder(data);
      
      if (response.success) {
        store.dispatch(reorderHeroSections(data.updates));
        store.dispatch(setLoading(false));
      } else {
        throw new Error(response.message || 'Failed to reorder hero sections');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder hero sections';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Bulk delete hero sections
  async bulkDeleteHeroSections(ids: string[]): Promise<void> {
    try {
      store.dispatch(setBulkOperating(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const deletePromises = ids.map(id => HeroSectionService.delete(id));
      const results = await Promise.allSettled(deletePromises);
      
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;
      
      if (succeeded > 0) {
        store.dispatch(removeHeroSections(ids));
      }
      
      if (failed > 0) {
        throw new Error(`Failed to delete ${failed} hero section(s)`);
      }
      
      store.dispatch(setBulkOperating(false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hero sections';
      store.dispatch(setError(errorMessage));
      store.dispatch(setBulkOperating(false));
      throw error;
    }
  },

  // Bulk update hero sections
  async bulkUpdateHeroSections(ids: string[], data: UpdateHeroSectionData): Promise<void> {
    try {
      store.dispatch(setBulkOperating(true));
      store.dispatch(setError(null));
      
      const { HeroSectionService } = await import('./content-service');
      const updatePromises = ids.map(id => HeroSectionService.update(id, data));
      const results = await Promise.allSettled(updatePromises);
      
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;
      
      if (succeeded > 0) {
        store.dispatch(bulkUpdateHeroSections({ ids, updates: data }));
      }
      
      if (failed > 0) {
        throw new Error(`Failed to update ${failed} hero section(s)`);
      }
      
      store.dispatch(setBulkOperating(false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hero sections';
      store.dispatch(setError(errorMessage));
      store.dispatch(setBulkOperating(false));
      throw error;
    }
  }
};

// Hook-based service for components
export const useHeroSectionReduxService = () => {
  const { data: heroSectionsData, isLoading, error, refetch } = useGetHeroSectionsQuery();
  const [createHeroSectionMutation, { isLoading: isCreating }] = useCreateHeroSectionMutation();
  const [updateHeroSectionMutation, { isLoading: isUpdating }] = useUpdateHeroSectionMutation();
  const [deleteHeroSectionMutation, { isLoading: isDeleting }] = useDeleteHeroSectionMutation();
  const [toggleStatusMutation, { isLoading: isToggling }] = useToggleHeroSectionStatusMutation();
  const [reorderMutation, { isLoading: isReordering }] = useReorderHeroSectionsMutation();
  const [bulkDeleteMutation, { isLoading: isBulkDeleting }] = useBulkDeleteHeroSectionsMutation();
  const [bulkUpdateMutation, { isLoading: isBulkUpdating }] = useBulkUpdateHeroSectionsMutation();

  const heroSections = heroSectionsData?.data || [];
  const pagination = heroSectionsData?.pagination;
  const isAnyLoading = isLoading || isCreating || isUpdating || isDeleting || isToggling || isReordering || isBulkDeleting || isBulkUpdating;

  const createHeroSection = async (data: CreateHeroSectionData) => {
    try {
      const result = await createHeroSectionMutation(data).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error creating hero section:', error);
      throw error;
    }
  };

  const updateHeroSection = async (id: string, data: UpdateHeroSectionData) => {
    try {
      const result = await updateHeroSectionMutation({ id, data }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error updating hero section:', error);
      throw error;
    }
  };

  const deleteHeroSection = async (id: string) => {
    try {
      await deleteHeroSectionMutation(id).unwrap();
    } catch (error) {
      console.error('Error deleting hero section:', error);
      throw error;
    }
  };

  const toggleHeroSectionStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleStatusMutation({ id, isActive }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error toggling hero section status:', error);
      throw error;
    }
  };

  const reorderHeroSections = async (data: ReorderHeroSectionsData) => {
    try {
      await reorderMutation(data).unwrap();
    } catch (error) {
      console.error('Error reordering hero sections:', error);
      throw error;
    }
  };

  const bulkDeleteHeroSections = async (ids: string[]) => {
    try {
      await bulkDeleteMutation(ids).unwrap();
    } catch (error) {
      console.error('Error bulk deleting hero sections:', error);
      throw error;
    }
  };

  const bulkUpdateHeroSections = async (ids: string[], data: UpdateHeroSectionData) => {
    try {
      await bulkUpdateMutation({ ids, data }).unwrap();
    } catch (error) {
      console.error('Error bulk updating hero sections:', error);
      throw error;
    }
  };

  return {
    heroSections,
    pagination,
    loading: isAnyLoading,
    error: error ? (typeof error === 'object' && 'message' in error ? error.message : 'An error occurred') : null,
    refetch,
    createHeroSection,
    updateHeroSection,
    deleteHeroSection,
    toggleHeroSectionStatus,
    reorderHeroSections,
    bulkDeleteHeroSections,
    bulkUpdateHeroSections,
  };
};

export default heroSectionReduxService;
