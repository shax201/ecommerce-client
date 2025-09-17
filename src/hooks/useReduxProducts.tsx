"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useGetNewArrivalsQuery,
  useGetTopSellingProductsQuery,
  useGetProductsByCategoryQuery,
  useGetWishlistQuery,
  useCreateProductReviewMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useTrackProductViewMutation,
} from "@/lib/features/products/productApi";
import {
  setCurrentFilters,
  updateFilters,
  clearFilters,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  selectCurrentFilters,
  selectPagination,
  selectSearchQuery,
  selectSortBy,
  selectSortOrder,
  selectIsLoadingFilter,
} from "@/lib/features/products/productsSlice";
import { ProductFilters } from "@/lib/features/products/productsSlice";

/**
 * Custom hook for managing products with Redux API
 * This demonstrates best practices for using Redux with RTK Query
 */
export function useReduxProducts() {
  const dispatch = useDispatch<AppDispatch>();
  
  // ===== REDUX STATE =====
  const currentFilters = useSelector(selectCurrentFilters);
  const pagination = useSelector(selectPagination);
  const searchQuery = useSelector(selectSearchQuery);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);
  const isLoadingFilter = useSelector(selectIsLoadingFilter);

  // ===== API QUERIES =====
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
    refetch: refetchProducts,
  } = useGetProductsQuery(currentFilters);

  const {
    data: newArrivalsData,
    isLoading: isLoadingNewArrivals,
    refetch: refetchNewArrivals,
  } = useGetNewArrivalsQuery({ limit: 10 });

  const {
    data: topSellingData,
    isLoading: isLoadingTopSelling,
    refetch: refetchTopSelling,
  } = useGetTopSellingProductsQuery({ limit: 10 });

  const {
    data: wishlistData,
    isLoading: isLoadingWishlist,
    refetch: refetchWishlist,
  } = useGetWishlistQuery({});

  // ===== API MUTATIONS =====
  const [createReview, { isLoading: isCreatingReview }] = useCreateProductReviewMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const [trackView, { isLoading: isTrackingView }] = useTrackProductViewMutation();

  // ===== COMPUTED VALUES =====
  const products = productsData?.data || [];
  const totalProducts = pagination.totalProducts;
  const totalPages = pagination.totalPages;
  const currentPage = pagination.currentPage;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const isLoading = isLoadingProducts || isLoadingFilter;
  const isError = !!productsError;

  // ===== FILTER ACTIONS =====
  const updateSearch = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(updateFilters({ search: query }));
  }, [dispatch]);

  const updateSorting = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc' = 'desc') => {
    dispatch(setSortBy(newSortBy));
    dispatch(setSortOrder(newSortOrder));
    dispatch(updateFilters({ 
      sortBy: newSortBy as any, 
      sortOrder: newSortOrder 
    }));
  }, [dispatch]);

  const updatePagination = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(updateFilters({ page }));
  }, [dispatch]);

  const updatePriceRange = useCallback((minPrice: number, maxPrice: number) => {
    dispatch(updateFilters({ minPrice, maxPrice }));
  }, [dispatch]);

  const updateCategory = useCallback((category: string) => {
    dispatch(updateFilters({ categories: [category] }));
  }, [dispatch]);

  const updateColors = useCallback((colors: string[]) => {
    dispatch(updateFilters({ colors }));
  }, [dispatch]);

  const updateSizes = useCallback((sizes: string[]) => {
    dispatch(updateFilters({ sizes }));
  }, [dispatch]);

  const updateStatus = useCallback((status: string[]) => {
    dispatch(updateFilters({ status }));
  }, [dispatch]);

  const updateFeatured = useCallback((featured: boolean) => {
    dispatch(updateFilters({ featured }));
  }, [dispatch]);

  const updateInStock = useCallback((inStock: boolean) => {
    dispatch(updateFilters({ inStock }));
  }, [dispatch]);

  const updateRating = useCallback((rating: number) => {
    dispatch(updateFilters({ rating }));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // ===== PAGINATION ACTIONS =====
  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      updatePagination(currentPage + 1);
    }
  }, [hasNextPage, currentPage, updatePagination]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) {
      updatePagination(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, updatePagination]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      updatePagination(page);
    }
  }, [totalPages, updatePagination]);

  const goToFirstPage = useCallback(() => {
    updatePagination(1);
  }, [updatePagination]);

  const goToLastPage = useCallback(() => {
    updatePagination(totalPages);
  }, [totalPages, updatePagination]);

  // ===== PRODUCT ACTIONS =====
  const refreshProducts = useCallback(() => {
    refetchProducts();
  }, [refetchProducts]);

  const refreshAll = useCallback(() => {
    refetchProducts();
    refetchNewArrivals();
    refetchTopSelling();
    refetchWishlist();
  }, [refetchProducts, refetchNewArrivals, refetchTopSelling, refetchWishlist]);

  // ===== WISHLIST ACTIONS =====
  const addProductToWishlist = useCallback(async (productId: string, notes?: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    try {
      await addToWishlist({
        productId,
        notes,
        priority,
      }).unwrap();
      
      // Refresh wishlist data
      refetchWishlist();
      
      return { success: true };
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, [addToWishlist, refetchWishlist]);

  const removeProductFromWishlist = useCallback(async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      
      // Refresh wishlist data
      refetchWishlist();
      
      return { success: true };
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, [removeFromWishlist, refetchWishlist]);

  // ===== REVIEW ACTIONS =====
  const createProductReview = useCallback(async (reviewData: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) => {
    try {
      await createReview(reviewData).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to create review:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, [createReview]);

  // ===== ANALYTICS ACTIONS =====
  const trackProductView = useCallback(async (productId: string) => {
    try {
      await trackView(productId).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to track view:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }, [trackView]);

  // ===== UTILITY FUNCTIONS =====
  const getProductById = useCallback((productId: string) => {
    return products.find(product => product.id === productId);
  }, [products]);

  const isProductInWishlist = useCallback((productId: string) => {
    return wishlistData?.data?.items?.some(item => item.productId === productId) || false;
  }, [wishlistData]);

  const getWishlistCount = useCallback(() => {
    return wishlistData?.data?.total || 0;
  }, [wishlistData]);

  // ===== EFFECTS =====
  useEffect(() => {
    // Auto-refresh data when filters change
    if (Object.keys(currentFilters).length > 0) {
      dispatch(setCurrentPage(1));
    }
  }, [currentFilters, dispatch]);

  // ===== RETURN API =====
  return {
    // ===== DATA =====
    products,
    newArrivals: newArrivalsData?.data || [],
    topSelling: topSellingData?.data || [],
    wishlist: wishlistData?.data?.items || [],
    
    // ===== PAGINATION =====
    pagination: {
      currentPage,
      totalPages,
      totalProducts,
      hasNextPage,
      hasPrevPage,
    },
    
    // ===== FILTERS =====
    filters: currentFilters,
    searchQuery,
    sortBy,
    sortOrder,
    
    // ===== LOADING STATES =====
    isLoading,
    isError,
    isFetching: isFetchingProducts,
    isLoadingNewArrivals,
    isLoadingTopSelling,
    isLoadingWishlist,
    isCreatingReview,
    isAddingToWishlist,
    isRemovingFromWishlist,
    isTrackingView,
    
    // ===== ERRORS =====
    error: productsError,
    
    // ===== FILTER ACTIONS =====
    updateSearch,
    updateSorting,
    updatePagination,
    updatePriceRange,
    updateCategory,
    updateColors,
    updateSizes,
    updateStatus,
    updateFeatured,
    updateInStock,
    updateRating,
    clearAllFilters,
    
    // ===== PAGINATION ACTIONS =====
    goToNextPage,
    goToPrevPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    
    // ===== PRODUCT ACTIONS =====
    refreshProducts,
    refreshAll,
    getProductById,
    
    // ===== WISHLIST ACTIONS =====
    addProductToWishlist,
    removeProductFromWishlist,
    isProductInWishlist,
    getWishlistCount,
    
    // ===== REVIEW ACTIONS =====
    createProductReview,
    
    // ===== ANALYTICS ACTIONS =====
    trackProductView,
  };
}

/**
 * Hook for single product operations
 */
export function useReduxSingleProduct(productId: string) {
  const {
    data: productData,
    error: productError,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useGetSingleProductQuery(productId, {
    skip: !productId,
  });

  const [createReview, { isLoading: isCreatingReview }] = useCreateProductReviewMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const [trackView, { isLoading: isTrackingView }] = useTrackProductViewMutation();

  const product = productData?.data;
  const isLoading = isLoadingProduct;
  const isError = !!productError;

  const createProductReview = async (reviewData: {
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) => {
    if (!productId) return { success: false, error: "No product ID" };
    
    try {
      await createReview({
        productId,
        ...reviewData,
      }).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to create review:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  const addToWishlistAction = async (notes?: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!productId) return { success: false, error: "No product ID" };
    
    try {
      await addToWishlist({
        productId,
        notes,
        priority,
      }).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  const removeFromWishlistAction = async () => {
    if (!productId) return { success: false, error: "No product ID" };
    
    try {
      await removeFromWishlist(productId).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  const trackProductView = async () => {
    if (!productId) return { success: false, error: "No product ID" };
    
    try {
      await trackView(productId).unwrap();
      return { success: true };
    } catch (error) {
      console.error("Failed to track view:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  return {
    product,
    isLoading,
    isError,
    error: productError,
    refetch: refetchProduct,
    createProductReview,
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
    trackProductView,
    isCreatingReview,
    isAddingToWishlist,
    isRemovingFromWishlist,
    isTrackingView,
  };
}

/**
 * Hook for category-specific products
 */
export function useReduxCategoryProducts(categoryId: string, filters?: ProductFilters) {
  const {
    data: categoryProductsData,
    error: categoryProductsError,
    isLoading: isLoadingCategoryProducts,
    refetch: refetchCategoryProducts,
  } = useGetProductsByCategoryQuery({
    categoryId,
    filters: filters || {},
  });

  const products = categoryProductsData?.data || [];
  const pagination = categoryProductsData?.pagination;
  const isLoading = isLoadingCategoryProducts;
  const isError = !!categoryProductsError;

  return {
    products,
    pagination,
    isLoading,
    isError,
    error: categoryProductsError,
    refetch: refetchCategoryProducts,
  };
}
