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
} from "@/lib/features/products/productsSlice";
import { useGetFilteredProductsQuery } from "@/lib/features/products/productApi";
import { skipToken } from "@reduxjs/toolkit/query";

const Filters = () => {
  const dispatch = useDispatch();
  const { colorSelection, sizeSelection, maxPrice, minPrice, category } =
    useSelector((state: RootState) => state.products);

  const handleColorChange = (color: { name: string; code: string }) => {
    dispatch(setColorSelection(color));
  };

  const handleSizeChange = (size: string) => {
    dispatch(setSizeSelection(size));
  };

  const { data, isLoading, error } = useGetFilteredProductsQuery({
    page: 1,
    minPrice,
    maxPrice,
    categories: category,
  });

  const handleApplyFilter = () => {
    // getFilteredProducts({
    //   page: 1,
    //   limit: 12,
    //   sortBy: "price",
    //   sortOrder: "asc",
    //   minPrice,
    //   maxPrice,
    //   color: colorSelection.name ? [colorSelection.name.toLowerCase()] : [],
    //   size: sizeSelection ? [sizeSelection] : [],
    //   categories: "68983543a777f0b720c6e02f",
    //   productType: "Clothing",
    // });
  };

  useEffect(() => {
    if (data?.success) {
      console.log("Filtered products:", data);
      dispatch(setFilteredProducts(data.data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setLoadingFilter(isLoading));
  }, [isLoading, dispatch]);

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection />
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
      <hr className="border-t-black/10" />
      <DressStyleSection />

      {/* <Button
        type="button"
        onClick={handleApplyFilter}
        disabled={isLoading}
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
      >
        {isLoading ? "Loading..." : "Apply Filter"}
      </Button> */}
    </>
  );
};

export default Filters;
