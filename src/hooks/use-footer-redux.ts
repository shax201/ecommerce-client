import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  useGetFooterQuery,
  useUpdateFooterMutation,
  useUpdateContactInfoMutation,
  useAddFooterSectionMutation,
  useUpdateFooterSectionMutation,
  useDeleteFooterSectionMutation,
  useAddFooterLinkMutation,
  useUpdateFooterLinkMutation,
  useDeleteFooterLinkMutation,
} from '@/lib/features/footer';
import {
  setFooter,
  setLoading,
  setUpdating,
  setDeleting,
  setError,
  setUpdateError,
  setDeleteError,
  clearErrors,
  setGeneralModalOpen,
  setContactModalOpen,
  setSectionModalOpen,
  setLinkModalOpen,
  setDeleteModalOpen,
  setEditingSection,
  setEditingLink,
  setDeletingItem,
  updateGeneralInfo,
  updateContactInfo,
  addSection,
  updateSection,
  removeSection,
  addLinkToSection,
  updateLinkInSection,
  removeLinkFromSection,
  type FooterFormData,
  type ContactInfoFormData,
  type FooterSectionFormData,
  type FooterLinkFormData,
  type FooterSection,
  type FooterLink,
} from '@/lib/features/footer';
import { toast } from 'sonner';

interface UseFooterReduxOptions {
  autoFetch?: boolean;
}

export function useFooterRedux(options: UseFooterReduxOptions = {}) {
  const { autoFetch = true } = options;
  
  const dispatch = useAppDispatch();
  
  // Redux state
  const footer = useAppSelector((state) => state.footer.footer);
  const loading = useAppSelector((state) => state.footer.loading);
  const updating = useAppSelector((state) => state.footer.updating);
  const deleting = useAppSelector((state) => state.footer.deleting);
  const error = useAppSelector((state) => state.footer.error);
  const updateError = useAppSelector((state) => state.footer.updateError);
  const deleteError = useAppSelector((state) => state.footer.deleteError);
  
  // UI state
  const isGeneralModalOpen = useAppSelector((state) => state.footer.isGeneralModalOpen);
  const isContactModalOpen = useAppSelector((state) => state.footer.isContactModalOpen);
  const isSectionModalOpen = useAppSelector((state) => state.footer.isSectionModalOpen);
  const isLinkModalOpen = useAppSelector((state) => state.footer.isLinkModalOpen);
  const isDeleteModalOpen = useAppSelector((state) => state.footer.isDeleteModalOpen);
  
  // Editing state
  const editingSection = useAppSelector((state) => state.footer.editingSection);
  const editingLink = useAppSelector((state) => state.footer.editingLink);
  const deletingItem = useAppSelector((state) => state.footer.deletingItem);
  
  // RTK Query hooks
  const {
    data: footerData,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useGetFooterQuery(undefined, {
    skip: !autoFetch,
  });
  
  const [updateFooterMutation, { isLoading: isUpdatingFooter }] = useUpdateFooterMutation();
  const [updateContactInfoMutation, { isLoading: isUpdatingContact }] = useUpdateContactInfoMutation();
  const [addFooterSectionMutation] = useAddFooterSectionMutation();
  const [updateFooterSectionMutation] = useUpdateFooterSectionMutation();
  const [deleteFooterSectionMutation] = useDeleteFooterSectionMutation();
  const [addFooterLinkMutation] = useAddFooterLinkMutation();
  const [updateFooterLinkMutation] = useUpdateFooterLinkMutation();
  const [deleteFooterLinkMutation] = useDeleteFooterLinkMutation();
  
  // ===== GENERAL INFO OPERATIONS =====
  
  const updateGeneralInfoRedux = useCallback(async (data: FooterFormData) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await updateFooterMutation(data).unwrap();
      
      if (result.success) {
        dispatch(updateGeneralInfo(data));
        toast.success('General information updated successfully');
        dispatch(setGeneralModalOpen(false));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to update general information'));
        toast.error(result.message || 'Failed to update general information');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update general information';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, updateFooterMutation]);
  
  // ===== CONTACT INFO OPERATIONS =====
  
  const updateContactInfoRedux = useCallback(async (data: ContactInfoFormData) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await updateContactInfoMutation(data).unwrap();
      
      if (result.success) {
        dispatch(updateContactInfo(data));
        toast.success('Contact information updated successfully');
        dispatch(setContactModalOpen(false));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to update contact information'));
        toast.error(result.message || 'Failed to update contact information');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update contact information';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, updateContactInfoMutation]);
  
  // ===== SECTION OPERATIONS =====
  
  const addSectionRedux = useCallback(async (data: FooterSectionFormData) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await addFooterSectionMutation(data).unwrap();
      
      if (result.success) {
        // The section will be added via cache invalidation
        toast.success('Footer section added successfully');
        dispatch(setSectionModalOpen(false));
        dispatch(setEditingSection(null));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to add footer section'));
        toast.error(result.message || 'Failed to add footer section');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to add footer section';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, addFooterSectionMutation]);
  
  const updateSectionRedux = useCallback(async (sectionId: string, data: Partial<FooterSectionFormData>) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await updateFooterSectionMutation({ sectionId, data }).unwrap();
      
      if (result.success) {
        // The section will be updated via cache invalidation
        toast.success('Footer section updated successfully');
        dispatch(setSectionModalOpen(false));
        dispatch(setEditingSection(null));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to update footer section'));
        toast.error(result.message || 'Failed to update footer section');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update footer section';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, updateFooterSectionMutation]);
  
  const deleteSectionRedux = useCallback(async (sectionId: string) => {
    try {
      dispatch(setDeleting(true));
      dispatch(clearErrors());
      
      const result = await deleteFooterSectionMutation(sectionId).unwrap();
      
      if (result.success) {
        // The section will be removed via cache invalidation
        toast.success('Footer section deleted successfully');
        dispatch(setDeleteModalOpen(false));
        dispatch(setDeletingItem(null));
      } else {
        dispatch(setDeleteError(result.message || 'Failed to delete footer section'));
        toast.error(result.message || 'Failed to delete footer section');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete footer section';
      dispatch(setDeleteError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setDeleting(false));
    }
  }, [dispatch, deleteFooterSectionMutation]);
  
  // ===== LINK OPERATIONS =====
  
  const addLinkRedux = useCallback(async (sectionId: string, data: FooterLinkFormData) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await addFooterLinkMutation({ sectionId, data }).unwrap();
      
      if (result.success) {
        // The link will be added via cache invalidation
        toast.success('Footer link added successfully');
        dispatch(setLinkModalOpen(false));
        dispatch(setEditingLink(null));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to add footer link'));
        toast.error(result.message || 'Failed to add footer link');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to add footer link';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, addFooterLinkMutation]);
  
  const updateLinkRedux = useCallback(async (sectionId: string, linkId: string, data: Partial<FooterLinkFormData>) => {
    try {
      dispatch(setUpdating(true));
      dispatch(clearErrors());
      
      const result = await updateFooterLinkMutation({ sectionId, linkId, data }).unwrap();
      
      if (result.success) {
        // The link will be updated via cache invalidation
        toast.success('Footer link updated successfully');
        dispatch(setLinkModalOpen(false));
        dispatch(setEditingLink(null));
      } else {
        dispatch(setUpdateError(result.message || 'Failed to update footer link'));
        toast.error(result.message || 'Failed to update footer link');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update footer link';
      dispatch(setUpdateError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setUpdating(false));
    }
  }, [dispatch, updateFooterLinkMutation]);
  
  const deleteLinkRedux = useCallback(async (sectionId: string, linkId: string) => {
    try {
      dispatch(setDeleting(true));
      dispatch(clearErrors());
      
      const result = await deleteFooterLinkMutation({ sectionId, linkId }).unwrap();
      
      if (result.success) {
        // The link will be removed via cache invalidation
        toast.success('Footer link deleted successfully');
        dispatch(setDeleteModalOpen(false));
        dispatch(setDeletingItem(null));
      } else {
        dispatch(setDeleteError(result.message || 'Failed to delete footer link'));
        toast.error(result.message || 'Failed to delete footer link');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete footer link';
      dispatch(setDeleteError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setDeleting(false));
    }
  }, [dispatch, deleteFooterLinkMutation]);
  
  // ===== UI OPERATIONS =====
  
  const openGeneralModal = useCallback(() => {
    dispatch(setGeneralModalOpen(true));
  }, [dispatch]);
  
  const closeGeneralModal = useCallback(() => {
    dispatch(setGeneralModalOpen(false));
  }, [dispatch]);
  
  const openContactModal = useCallback(() => {
    dispatch(setContactModalOpen(true));
  }, [dispatch]);
  
  const closeContactModal = useCallback(() => {
    dispatch(setContactModalOpen(false));
  }, [dispatch]);
  
  const openSectionModal = useCallback((section?: FooterSection) => {
    if (section) {
      dispatch(setEditingSection(section));
    } else {
      dispatch(setEditingSection(null));
    }
    dispatch(setSectionModalOpen(true));
  }, [dispatch]);
  
  const closeSectionModal = useCallback(() => {
    dispatch(setSectionModalOpen(false));
    dispatch(setEditingSection(null));
  }, [dispatch]);
  
  const openLinkModal = useCallback((link?: FooterLink, sectionId?: string) => {
    if (link && sectionId) {
      dispatch(setEditingLink({ link, sectionId }));
    } else {
      dispatch(setEditingLink(null));
    }
    dispatch(setLinkModalOpen(true));
  }, [dispatch]);
  
  const closeLinkModal = useCallback(() => {
    dispatch(setLinkModalOpen(false));
    dispatch(setEditingLink(null));
  }, [dispatch]);
  
  const openDeleteModal = useCallback((type: 'section' | 'link', item: any, sectionId?: string) => {
    dispatch(setDeletingItem({ type, item, sectionId }));
    dispatch(setDeleteModalOpen(true));
  }, [dispatch]);
  
  const closeDeleteModal = useCallback(() => {
    dispatch(setDeleteModalOpen(false));
    dispatch(setDeletingItem(null));
  }, [dispatch]);
  
  // ===== UTILITY FUNCTIONS =====
  
  const refreshFooter = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);
  
  // ===== RETURN VALUES =====
  
  return {
    // Data
    footer: footerData?.data || footer,
    isInitialized: !!footerData?.data || !!footer,
    
    // Loading states
    loading: loading || isFetching,
    updating: updating || isUpdatingFooter || isUpdatingContact,
    deleting,
    
    // Error states
    error: error || fetchError,
    updateError,
    deleteError,
    
    // UI states
    isGeneralModalOpen,
    isContactModalOpen,
    isSectionModalOpen,
    isLinkModalOpen,
    isDeleteModalOpen,
    
    // Editing states
    editingSection,
    editingLink,
    deletingItem,
    
    // Operations
    updateGeneralInfo: updateGeneralInfoRedux,
    updateContactInfo: updateContactInfoRedux,
    addSection: addSectionRedux,
    updateSection: updateSectionRedux,
    deleteSection: deleteSectionRedux,
    addLink: addLinkRedux,
    updateLink: updateLinkRedux,
    deleteLink: deleteLinkRedux,
    
    // UI operations
    openGeneralModal,
    closeGeneralModal,
    openContactModal,
    closeContactModal,
    openSectionModal,
    closeSectionModal,
    openLinkModal,
    closeLinkModal,
    openDeleteModal,
    closeDeleteModal,
    
    // Utility functions
    refreshFooter,
    clearAllErrors,
  };
}
