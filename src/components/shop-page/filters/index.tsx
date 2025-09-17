"use client";

import React, { useEffect, useState } from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  setColorSelection,
  setFilteredProducts,
  setLoadingFilter,
  setSizeSelection,
  setCurrentFilters,
  updateFilters,
  clearFilters,
} from "@/lib/features/products/productsSlice";
import { useGetProductsQuery } from "@/lib/features/products/productApi";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    colorSelection, 
    sizeSelection, 
    maxPrice, 
    minPrice, 
    category,
    currentFilters,
    isLoadingFilter 
  } = useSelector((state: RootState) => state.products);

  const handleColorChange = (color: { name: string; code: string }) => {
    dispatch(setColorSelection(color));
    // Update Redux filters with color
    dispatch(updateFilters({ colors: [color.name.toLowerCase()] }));
    // Update URL immediately for better UX
    updateUrlWithFilters({ color: color.name });
  };

  const handleSizeChange = (size: string) => {
    dispatch(setSizeSelection(size));
    // Update Redux filters with size
    dispatch(updateFilters({ sizes: [size] }));
    // Update URL immediately for better UX
    updateUrlWithFilters({ size });
  };

  const handleCategoryChange = (categoryId: string) => {
    // This will be handled by CategoriesSection component
    updateUrlWithFilters({ category: categoryId });
  };

  const handlePriceChange = (priceRange: { min: number; max: number }) => {
    dispatch(updateFilters({ 
      minPrice: priceRange.min, 
      maxPrice: priceRange.max 
    }));
    updateUrlWithFilters({ 
      minPrice: priceRange.min.toString(), 
      maxPrice: priceRange.max.toString() 
    });
  };

  // Update URL with current filters
  const updateUrlWithFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    router.push('/shop', { scroll: false });
  };

  // Apply filters (this will trigger the API call in ShopClient)
  const handleApplyFilter = () => {
    const filters = {
      page: 1,
      minPrice,
      maxPrice,
      categories: category ? [category] : undefined,
      colors: colorSelection.name ? [colorSelection.name.toLowerCase()] : undefined,
      sizes: sizeSelection ? [sizeSelection] : undefined,
    };
    
    dispatch(setCurrentFilters(filters));
    
    // Update URL with all current filters
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice.toString());
    if (maxPrice) params.set('maxPrice', maxPrice.toString());
    if (category) params.set('category', category);
    if (colorSelection.name) params.set('color', colorSelection.name);
    if (sizeSelection) params.set('size', sizeSelection);
    params.set('page', '1');
    
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters = minPrice || maxPrice || category || colorSelection.name || sizeSelection;

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection onPriceChange={handlePriceChange} />
      <hr className="border-t-black/10" />
      <ColorsSection
        selectedColor={colorSelection}
        onColorSelect={handleColorChange}
      />
      <hr className="border-t-black/10" />
      <SizeSection
        selectedSize={sizeSelection}
        onSizeSelect={handleSizeChange}
      />
      {/* <hr className="border-t-black/10" />
      <DressStyleSection /> */}

      {/* Filter Actions */}
      <div className="space-y-3 pt-4">
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="w-full rounded-full text-sm font-medium py-3 h-10"
          >
            Clear All Filters
          </Button>
        )}
        
        <Button
          type="button"
          onClick={handleApplyFilter}
          disabled={isLoadingFilter}
          className="bg-black w-full rounded-full text-sm font-medium py-4 h-12 hover:bg-gray-800"
        >
          {isLoadingFilter ? "Applying..." : "Apply Filters"}
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {minPrice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Min: ${minPrice}
              </span>
            )}
            {maxPrice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Max: ${maxPrice}
              </span>
            )}
            {category && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Category: {category}
              </span>
            )}
            {colorSelection.name && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Color: {colorSelection.name}
              </span>
            )}
            {sizeSelection && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Size: {sizeSelection}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;
