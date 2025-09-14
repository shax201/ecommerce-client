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
  const sortByParam =
    typeof params.sortBy === "string" ? params.sortBy : "most-popular";
  
  // Map frontend sort values to backend sort values
  const sortByMap: Record<string, 'createdAt' | 'updatedAt' | 'price' | 'rating' | 'popularity'> = {
    'most-popular': 'popularity',
    'newest': 'createdAt',
    'price-low-high': 'price',
    'price-high-low': 'price',
    'rating': 'rating',
    'name-a-z': 'createdAt', // Using createdAt as fallback for name sorting
    'name-z-a': 'createdAt',
  };
  
  const sortBy = sortByMap[sortByParam] || 'popularity';
  
  // Determine sort order based on sortByParam
  const sortOrder = sortByParam === 'price-high-low' ? 'desc' : 'asc';
  
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
    categories: category ? [category] : undefined,
    sortBy,
    sortOrder,
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
