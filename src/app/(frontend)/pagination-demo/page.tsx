"use client";

import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/lib/features/products/productApi";
import ProductPagination, { CompactPagination } from "@/components/common/ProductPagination";
import ProductCard from "@/components/common/ProductCard";
import ProductCardSkeleton from "@/components/common/Skeleton";
import { Product } from "@/types/product.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Grid, 
  List, 
  Filter,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";

// Transform ProductData to Product type
const transformProductData = (productData: any): Product => {
  return {
    id: parseInt(productData._id) || 0,
    title: productData.title || "",
    description: productData.description || "",
    primaryImage: productData.primaryImage || "",
    optionalImages: productData.optionalImages || [],
    regularPrice: productData.regularPrice || 0,
    discountPrice: productData.discountPrice || 0,
    price: productData.regularPrice || 0, // Use regularPrice as base price
    discount: {
      amount: productData.discountPrice ? productData.regularPrice - productData.discountPrice : 0,
      percentage: productData.discountPrice ? Math.round(((productData.regularPrice - productData.discountPrice) / productData.regularPrice) * 100) : 0
    },
    rating: 4.5, // Default rating since it's not in ProductData
    catagory: productData.catagory || [],
    variants: {
      color: productData.color?.map((c: string) => ({ name: c, code: c })) || [],
      size: productData.size || []
    },
    colors: productData.color?.map((c: string, index: number) => ({ id: index.toString(), name: c, code: c })) || [],
    sizes: productData.size?.map((s: string, index: number) => ({ id: index.toString(), size: s })) || []
  };
};

/**
 * Pagination Demo Page
 * Shows different pagination styles and features
 */
export default function PaginationDemoPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInfo, setShowInfo] = useState(true);
  const [showJumpButtons, setShowJumpButtons] = useState(true);

  // Fetch products with pagination
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    sortBy: sortBy as any,
    sortOrder: "desc",
  });

  const products = productsData?.data || [];
  const pagination = {
    currentPage: productsData?.pagination?.page || currentPage,
    totalPages: productsData?.pagination?.totalPages || 1,
    totalProducts: productsData?.pagination?.total || 0,
    hasNextPage: productsData?.pagination?.hasNext || false,
    hasPrevPage: productsData?.pagination?.hasPrev || false,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = () => {
    refetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Pagination Demo</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore different pagination styles and features. This demo shows how pagination works 
            with real product data from your API.
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Pagination Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Items per page</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="createdAt">Newest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">View mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Actions</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoadingProducts}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Styles */}
        <Tabs defaultValue="full" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="full">Full Pagination</TabsTrigger>
            <TabsTrigger value="compact">Compact Pagination</TabsTrigger>
            <TabsTrigger value="custom">Custom Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Full Pagination Component</CardTitle>
                <p className="text-sm text-gray-600">
                  Complete pagination with page numbers, jump buttons, and product info
                </p>
              </CardHeader>
              <CardContent>
                {/* Products Grid */}
                <div className={`grid gap-4 mb-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {isLoadingProducts ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))
                  ) : productsError ? (
                    <div className="col-span-full text-center py-8 text-red-600">
                      Failed to load products
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-600">
                      No products found
                    </div>
                  ) : (
                    products.map((product) => (
                      <ProductCard key={product._id} data={transformProductData(product)} />
                    ))
                  )}
                </div>

                {/* Full Pagination */}
                <ProductPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingProducts}
                  itemsPerPage={itemsPerPage}
                  showInfo={true}
                  showJumpButtons={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compact Pagination</CardTitle>
                <p className="text-sm text-gray-600">
                  Minimal pagination for mobile or space-constrained areas
                </p>
              </CardHeader>
              <CardContent>
                {/* Products Grid */}
                <div className={`grid gap-4 mb-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {isLoadingProducts ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))
                  ) : productsError ? (
                    <div className="col-span-full text-center py-8 text-red-600">
                      Failed to load products
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-600">
                      No products found
                    </div>
                  ) : (
                    products.map((product) => (
                      <ProductCard key={product._id} data={transformProductData(product)} />
                    ))
                  )}
                </div>

                {/* Compact Pagination */}
                <CompactPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingProducts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Pagination Settings</CardTitle>
                <p className="text-sm text-gray-600">
                  Customize pagination display options
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showInfo"
                        checked={showInfo}
                        onChange={(e) => setShowInfo(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="showInfo" className="text-sm font-medium">
                        Show product info (e.g., "Showing 1-12 of 100 products")
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showJumpButtons"
                        checked={showJumpButtons}
                        onChange={(e) => setShowJumpButtons(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="showJumpButtons" className="text-sm font-medium">
                        Show jump to first/last buttons
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Settings:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Items per page: {itemsPerPage}</div>
                      <div>• Sort by: {sortBy}</div>
                      <div>• View mode: {viewMode}</div>
                      <div>• Show info: {showInfo ? "Yes" : "No"}</div>
                      <div>• Show jump buttons: {showJumpButtons ? "Yes" : "No"}</div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className={`grid gap-4 mb-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {isLoadingProducts ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))
                  ) : productsError ? (
                    <div className="col-span-full text-center py-8 text-red-600">
                      Failed to load products
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-600">
                      No products found
                    </div>
                  ) : (
                    products.map((product) => (
                      <ProductCard key={product._id} data={transformProductData(product)} />
                    ))
                  )}
                </div>

                {/* Custom Pagination */}
                <ProductPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingProducts}
                  itemsPerPage={itemsPerPage}
                  showInfo={showInfo}
                  showJumpButtons={showJumpButtons}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Current API Call</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>GET /api/v1/products</div>
                  <div>Query Parameters:</div>
                  <div>• page: {currentPage}</div>
                  <div>• limit: {itemsPerPage}</div>
                  <div>• sortBy: {sortBy}</div>
                  <div>• sortOrder: desc</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Pagination Response</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <pre>{JSON.stringify(pagination, null, 2)}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
