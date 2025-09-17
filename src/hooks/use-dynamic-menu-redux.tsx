"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useGetDynamicMenusQuery,
  useGetDynamicMenuByIdQuery,
  useCreateDynamicMenuMutation,
  useUpdateDynamicMenuMutation,
  useDeleteDynamicMenuMutation,
  useCreateDynamicMenuItemMutation,
  useUpdateDynamicMenuItemMutation,
  useDeleteDynamicMenuItemMutation,
  useReorderDynamicMenuItemsMutation,
  useBulkActivateDynamicMenusMutation,
  useBulkDeactivateDynamicMenusMutation,
  useBulkDeleteDynamicMenusMutation,
} from "@/lib/features/dynamic-menus";
import { 
  DynamicMenuFormData, 
  DynamicMenuItemFormData, 
  ReorderRequest 
} from "@/actions/content";
import {
  setLoading,
  setError,
  setMenus,
  addMenu,
  updateMenu,
  removeMenu,
  setSelectedMenu,
  updateSelectedMenuItems,
  addItemToSelectedMenu,
  updateItemInSelectedMenu,
  removeItemFromSelectedMenu,
  setPagination,
  setFilters,
  clearData,
  selectDynamicMenus,
  selectSelectedMenu,
  selectDynamicMenusPagination,
  selectDynamicMenusFilters,
  selectDynamicMenusLoading,
  selectDynamicMenusError,
  selectDynamicMenusLastFetch,
} from "@/lib/features/dynamic-menus";
import type { RootState, AppDispatch } from "@/lib/store";

interface UseDynamicMenuReduxOptions {
  initialMenus?: any[];
  initialPagination?: any;
  autoFetch?: boolean;
}

export function useDynamicMenuRedux(options: UseDynamicMenuReduxOptions = {}) {
  const {
    initialMenus = [],
    initialPagination,
    autoFetch = true,
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const menus = useSelector(selectDynamicMenus);
  const selectedMenu = useSelector(selectSelectedMenu);
  const pagination = useSelector(selectDynamicMenusPagination);
  const filters = useSelector(selectDynamicMenusFilters);
  const loading = useSelector(selectDynamicMenusLoading);
  const error = useSelector(selectDynamicMenusError);
  const lastFetch = useSelector(selectDynamicMenusLastFetch);

  // API hooks
  const {
    data: menusData,
    isLoading: isLoadingMenus,
    error: menusError,
    refetch: refetchMenus,
  } = useGetDynamicMenusQuery(filters, {
    skip: !autoFetch,
  });

  // Mutations
  const [createMenu, { isLoading: isCreatingMenu }] = useCreateDynamicMenuMutation();
  const [updateMenuMutation, { isLoading: isUpdatingMenu }] = useUpdateDynamicMenuMutation();
  const [deleteMenuMutation, { isLoading: isDeletingMenu }] = useDeleteDynamicMenuMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateDynamicMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdatingItem }] = useUpdateDynamicMenuItemMutation();
  const [deleteMenuItem, { isLoading: isDeletingItem }] = useDeleteDynamicMenuItemMutation();
  const [reorderItems, { isLoading: isReorderingItems }] = useReorderDynamicMenuItemsMutation();
  const [bulkActivate, { isLoading: isBulkActivating }] = useBulkActivateDynamicMenusMutation();
  const [bulkDeactivate, { isLoading: isBulkDeactivating }] = useBulkDeactivateDynamicMenusMutation();
  const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteDynamicMenusMutation();

  // Update local state when API data changes
  useEffect(() => {
    if (menusData?.success && menusData.data) {
      dispatch(setMenus(menusData.data));
      if (menusData.pagination) {
        dispatch(setPagination(menusData.pagination));
      }
    }
  }, [menusData, dispatch]);

  // Initialize with provided data
  useEffect(() => {
    if (initialMenus.length > 0 && menus.length === 0) {
      dispatch(setMenus(initialMenus));
      if (initialPagination) {
        dispatch(setPagination(initialPagination));
      }
    }
  }, [initialMenus, initialPagination, menus.length, dispatch]);

  // Set loading state based on API calls
  useEffect(() => {
    dispatch(setLoading(isLoadingMenus || isCreatingMenu || isUpdatingMenu || isDeletingMenu || isCreatingItem || isUpdatingItem || isDeletingItem || isReorderingItems || isBulkActivating || isBulkDeactivating || isBulkDeleting));
  }, [
    isLoadingMenus,
    isCreatingMenu,
    isUpdatingMenu,
    isDeletingMenu,
    isCreatingItem,
    isUpdatingItem,
    isDeletingItem,
    isReorderingItems,
    isBulkActivating,
    isBulkDeactivating,
    isBulkDeleting,
    dispatch,
  ]);

  // Set error state
  useEffect(() => {
    if (menusError) {
      dispatch(setError(menusError.toString()));
    }
  }, [menusError, dispatch]);

  // Actions
  const loadMenus = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await refetchMenus();
    } catch (error) {
      dispatch(setError("Failed to load menus"));
      toast.error("Failed to load menus");
    } finally {
      dispatch(setLoading(false));
    }
  }, [refetchMenus, dispatch]);

  const createMenuAction = useCallback(async (menuData: DynamicMenuFormData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await createMenu(menuData).unwrap();
      
      if (result.success) {
        dispatch(addMenu(result.data));
        toast.success("Menu created successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to create menu");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create menu";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [createMenu, dispatch]);

  const updateMenuAction = useCallback(async (menuId: string, menuData: Partial<DynamicMenuFormData>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await updateMenuMutation({ menuId, data: menuData }).unwrap();
      
      if (result.success) {
        dispatch(updateMenu(result.data));
        if (selectedMenu?._id === menuId) {
          dispatch(setSelectedMenu(result.data));
        }
        toast.success("Menu updated successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to update menu");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update menu";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [updateMenuMutation, selectedMenu, dispatch]);

  const deleteMenuAction = useCallback(async (menuId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await deleteMenuMutation(menuId).unwrap();
      
      if (result.success) {
        dispatch(removeMenu(menuId));
        if (selectedMenu?._id === menuId) {
          dispatch(setSelectedMenu(null));
        }
        toast.success("Menu deleted successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to delete menu");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete menu";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [deleteMenuMutation, selectedMenu, dispatch]);

  const createMenuItemAction = useCallback(async (menuId: string, itemData: DynamicMenuItemFormData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await createMenuItem({ menuId, data: itemData }).unwrap();
      
      if (result.success) {
        dispatch(addItemToSelectedMenu(result.data));
        toast.success("Menu item created successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to create menu item");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create menu item";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [createMenuItem, dispatch]);

  const updateMenuItemAction = useCallback(async (menuId: string, itemId: number, itemData: Partial<DynamicMenuItemFormData>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await updateMenuItem({ menuId, itemId, data: itemData }).unwrap();
      
      if (result.success) {
        dispatch(updateItemInSelectedMenu(result.data));
        toast.success("Menu item updated successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to update menu item");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update menu item";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [updateMenuItem, dispatch]);

  const deleteMenuItemAction = useCallback(async (menuId: string, itemId: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await deleteMenuItem({ menuId, itemId }).unwrap();
      
      if (result.success) {
        dispatch(removeItemFromSelectedMenu(itemId));
        toast.success("Menu item deleted successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to delete menu item");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete menu item";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [deleteMenuItem, dispatch]);

  const reorderItemsAction = useCallback(async (menuId: string, updates: ReorderRequest[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await reorderItems({ menuId, updates }).unwrap();
      
      if (result.success) {
        // Update local state with new order
        if (selectedMenu?._id === menuId) {
          const updatedItems = selectedMenu.items.map(item => {
            const update = updates[0]?.updates.find(u => u.id === item.id.toString());
            return update ? { ...item, order: update.order } : item;
          }).sort((a, b) => a.order - b.order);
          dispatch(updateSelectedMenuItems(updatedItems));
        }
        toast.success("Items reordered successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to reorder items");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to reorder items";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [reorderItems, selectedMenu, dispatch]);

  const bulkActivateAction = useCallback(async (menuIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkActivate(menuIds).unwrap();
      
      if (result.success) {
        // Update local state
        menuIds.forEach(menuId => {
          const menu = menus.find(m => m._id === menuId);
          if (menu) {
            dispatch(updateMenu({ ...menu, isActive: true }));
          }
        });
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to activate menus");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to activate menus";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkActivate, menus, dispatch]);

  const bulkDeactivateAction = useCallback(async (menuIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkDeactivate(menuIds).unwrap();
      
      if (result.success) {
        // Update local state
        menuIds.forEach(menuId => {
          const menu = menus.find(m => m._id === menuId);
          if (menu) {
            dispatch(updateMenu({ ...menu, isActive: false }));
          }
        });
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to deactivate menus");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to deactivate menus";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkDeactivate, menus, dispatch]);

  const bulkDeleteAction = useCallback(async (menuIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkDelete(menuIds).unwrap();
      
      if (result.success) {
        // Update local state
        menuIds.forEach(menuId => {
          dispatch(removeMenu(menuId));
        });
        if (selectedMenu && menuIds.includes(selectedMenu._id!)) {
          dispatch(setSelectedMenu(null));
        }
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to delete menus");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete menus";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkDelete, selectedMenu, dispatch]);

  const setSelectedMenuAction = useCallback((menu: any) => {
    dispatch(setSelectedMenu(menu));
  }, [dispatch]);

  const setFiltersAction = useCallback((newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch, filters]);

  const clearDataAction = useCallback(() => {
    dispatch(clearData());
  }, [dispatch]);

  const refreshAction = useCallback(async () => {
    await loadMenus();
  }, [loadMenus]);

  return {
    // State
    menus,
    selectedMenu,
    pagination,
    filters,
    loading,
    error,
    lastFetch,
    
    // Actions
    loadMenus: loadMenus,
    createMenu: createMenuAction,
    updateMenu: updateMenuAction,
    deleteMenu: deleteMenuAction,
    createMenuItem: createMenuItemAction,
    updateMenuItem: updateMenuItemAction,
    deleteMenuItem: deleteMenuItemAction,
    reorderItems: reorderItemsAction,
    bulkActivate: bulkActivateAction,
    bulkDeactivate: bulkDeactivateAction,
    bulkDelete: bulkDeleteAction,
    setSelectedMenu: setSelectedMenuAction,
    setFilters: setFiltersAction,
    clearData: clearDataAction,
    refresh: refreshAction,
    
    // Computed values
    dataSource: "redux",
    performanceMetrics: {
      lastFetch,
      cacheHit: lastFetch ? Date.now() - lastFetch < 60000 : false,
    },
  };
}
