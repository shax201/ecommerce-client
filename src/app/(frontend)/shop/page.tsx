import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import ShopClient from "./ShopClient";
import { getAllProducts } from "@/actions/products";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Parse search parameters for ISR
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const sortBy =
    typeof params.sortBy === "string" ? params.sortBy : "most-popular";
  const minPrice =
    typeof params.minPrice === "string"
      ? parseFloat(params.minPrice)
      : undefined;
  const maxPrice =
    typeof params.maxPrice === "string"
      ? parseFloat(params.maxPrice)
      : undefined;

  // Fetch products at build time
  const productsResponse = await getAllProducts({
    page,
    limit: 12,
    category,
    sortBy,
    minPrice,
    maxPrice,
  });

  const initialProducts = productsResponse.success ? productsResponse.data : [];
  const initialPagination = productsResponse.success
    ? productsResponse.pagination
    : undefined;

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialPagination={initialPagination}
      category={category}
      filters={{ minPrice, maxPrice, sortBy }}
    />
  );
}
