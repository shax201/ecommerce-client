// Redux-based Logo Service
// This service provides Redux integration for logo management

import { store } from '@/lib/store';
import { 
  useGetLogosQuery,
  useCreateLogoMutation,
  useUpdateLogoMutation,
  useDeleteLogoMutation,
  useToggleLogoStatusMutation,
  type LogoData,
  type CreateLogoData,
  type UpdateLogoData
} from '@/lib/features/logos';
import { 
  setLogos, 
  addLogo, 
  updateLogo, 
  removeLogo, 
  setLoading, 
  setError 
} from '@/lib/features/logos';

// Redux-based logo service
export const logoReduxService = {
  // Get all logos using Redux query
  async getLogos(): Promise<LogoData[]> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      // This would typically be called from a component using the hook
      // For service usage, we'll use the legacy service as fallback
      const { logoService } = await import('./logo-service');
      const logos = await logoService.getLogos();
      
      store.dispatch(setLogos(logos));
      store.dispatch(setLoading(false));
      
      return logos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch logos';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Create logo using Redux mutation
  async createLogo(data: CreateLogoData): Promise<LogoData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { logoService } = await import('./logo-service');
      const newLogo = await logoService.createLogo(data);
      
      store.dispatch(addLogo(newLogo));
      store.dispatch(setLoading(false));
      
      return newLogo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create logo';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Update logo using Redux mutation
  async updateLogo(id: string, data: UpdateLogoData): Promise<LogoData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { logoService } = await import('./logo-service');
      const updatedLogo = await logoService.updateLogo(id, data);
      
      store.dispatch(updateLogo(updatedLogo));
      store.dispatch(setLoading(false));
      
      return updatedLogo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update logo';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Delete logo using Redux mutation
  async deleteLogo(id: string): Promise<void> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { logoService } = await import('./logo-service');
      await logoService.deleteLogo(id);
      
      store.dispatch(removeLogo(id));
      store.dispatch(setLoading(false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete logo';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  },

  // Toggle logo active status
  async toggleLogoStatus(id: string, isActive: boolean): Promise<LogoData> {
    try {
      store.dispatch(setLoading(true));
      store.dispatch(setError(null));
      
      const { logoService } = await import('./logo-service');
      const updatedLogo = await logoService.updateLogo(id, { isActive });
      
      store.dispatch(updateLogo(updatedLogo));
      store.dispatch(setLoading(false));
      
      return updatedLogo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle logo status';
      store.dispatch(setError(errorMessage));
      store.dispatch(setLoading(false));
      throw error;
    }
  }
};

// Hook-based service for components
export const useLogoReduxService = () => {
  const { data: logosData, isLoading, error, refetch } = useGetLogosQuery();
  const [createLogoMutation, { isLoading: isCreating }] = useCreateLogoMutation();
  const [updateLogoMutation, { isLoading: isUpdating }] = useUpdateLogoMutation();
  const [deleteLogoMutation, { isLoading: isDeleting }] = useDeleteLogoMutation();
  const [toggleStatusMutation, { isLoading: isToggling }] = useToggleLogoStatusMutation();

  const logos = logosData?.data || [];
  const isAnyLoading = isLoading || isCreating || isUpdating || isDeleting || isToggling;

  const createLogo = async (data: CreateLogoData) => {
    try {
      const result = await createLogoMutation(data).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error creating logo:', error);
      throw error;
    }
  };

  const updateLogo = async (id: string, data: UpdateLogoData) => {
    try {
      const result = await updateLogoMutation({ id, data }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
  };

  const deleteLogo = async (id: string) => {
    try {
      await deleteLogoMutation(id).unwrap();
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  };

  const toggleLogoStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleStatusMutation({ id, isActive }).unwrap();
      return result.data;
    } catch (error) {
      console.error('Error toggling logo status:', error);
      throw error;
    }
  };

  return {
    logos,
    loading: isAnyLoading,
    error: error?.message || null,
    refetch,
    createLogo,
    updateLogo,
    deleteLogo,
    toggleLogoStatus,
  };
};

export default logoReduxService;
