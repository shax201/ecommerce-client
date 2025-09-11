"use client";

import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import ProductDetailsSkeleton from "@/components/product-page/ProductDetailsSkeleton";
import { Tabs } from "@radix-ui/react-tabs";
import { notFound } from "next/navigation";
import React, { FC, useEffect } from "react";
import { useProductISR } from "@/hooks/use-product-isr";

interface IProductDetails {
  id: string;
  initialProduct?: any;
}

const ProductDetails: FC<IProductDetails> = ({ id, initialProduct }) => {
  const { product, loading, error, dataSource, performanceMetrics } =
    useProductISR({
      productId: id,
      initialProduct,
    });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Product ISR Debug:", {
      loading,
      error,
      dataSource,
      performanceMetrics,
      hasProduct: !!product,
    });
  }

  // Show skeleton while loading
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!loading && (!product || error)) {
    notFound(); // fallback if the product wasn't found
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        {product && (
          <>
            <BreadcrumbProduct title={product?.title ?? "product"} />
            <section className="mb-11">
              <Header data={product} />
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
