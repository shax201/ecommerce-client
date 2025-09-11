import ProductDetails from "./ProductDetails";

export default async function ProductPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const productId = params.slug[0]
  console.log("params",productId)
  return <ProductDetails id={productId} />;
}
