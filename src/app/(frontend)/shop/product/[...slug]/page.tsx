import ProductDetails from "./ProductDetails";
import { getSingleProduct } from "@/actions/products";
import { notFound } from "next/navigation";

export default async function ProductPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const productId = params.slug[0];

  // Fetch product at build time
  const product = await getSingleProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetails id={productId} initialProduct={product} />
  );
}
