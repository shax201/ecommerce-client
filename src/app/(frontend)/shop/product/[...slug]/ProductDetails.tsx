"use client";

import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import ProductDetailsSkeleton from "@/components/product-page/ProductDetailsSkeleton";
import { useGetSingleProductQuery } from "@/lib/features/products/productApi";
import { Tabs } from "@radix-ui/react-tabs";
import { notFound } from "next/navigation";
import React, { FC, useEffect } from "react";

interface IProductDetails {
  id: string;
}

const ProductDetails: FC<IProductDetails> = ({ id }) => {
  const { data, isLoading, error } = useGetSingleProductQuery(id);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log("", data);

  // Show skeleton while loading
  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!isLoading && (!data || !data.success)) {
    notFound(); // fallback if the product wasn't found
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        {data && (
          <>
            <BreadcrumbProduct title={data?.data?.title ?? "product"} />
            <section className="mb-11">
              <Header data={data.data} />
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
