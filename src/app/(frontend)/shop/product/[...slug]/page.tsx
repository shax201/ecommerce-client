"use client";

import ProductDetails from "./ProductDetails";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams() as { slug: string[] };
  const productId = params.slug[0];

  if (!productId) {
    notFound();
  }

  return (
    <ProductDetails id={productId} />
  );
}
