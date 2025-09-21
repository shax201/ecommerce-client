"use client";

import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import ProductDetailsSkeleton from "@/components/product-page/ProductDetailsSkeleton";
import { Tabs } from "@radix-ui/react-tabs";
import { notFound } from "next/navigation";
import React, { FC, useEffect, useMemo } from "react";
import { useProductRedux } from "@/hooks/use-product-redux";

interface IProductDetails {
  id: string;
}

const ProductDetails: FC<IProductDetails> = ({ id }) => {
  // Use Redux-based product hook
  const { 
    product: transformedProduct,
    loading, 
    error, 
    isError,
    isSuccess,
    performanceMetrics,
    dataSource,
    refetch
  } = useProductRedux({ 
    productId: id,
    skip: !id 
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Product Redux Debug:", {
      loading,
      error,
      isError,
      isSuccess,
      hasProduct: !!transformedProduct,
      performanceMetrics,
      dataSource,
      productId: id,
    });
  }

  // Show skeleton while loading
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!loading && (!transformedProduct || isError)) {
    notFound(); // fallback if the product wasn't found
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        {transformedProduct && (
          <>
            <BreadcrumbProduct title={transformedProduct?.title ?? "product"} />
            <section className="mb-11">
              <Header data={transformedProduct} />
            </section>
            <Tabs />
          </>
        )}
      </div>
      <div className="mb-[50px] sm:mb-20">
        {/* <ProductListSec title="You might also like" data={relatedProductData} /> */}
      </div>
    </main>
  );
};

export default ProductDetails;
