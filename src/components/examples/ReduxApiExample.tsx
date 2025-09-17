"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useGetNewArrivalsQuery,
  useGetTopSellingProductsQuery,
  useGetProductsByCategoryQuery,
  useGetWishlistQuery,
  useCreateProductReviewMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useTrackProductViewMutation,
} from "@/lib/features/products/productApi";
import {
  setCurrentFilters,
  updateFilters,
  clearFilters,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  selectCurrentFilters,
  selectPagination,
  selectSearchQuery,
  selectSortBy,
  selectSortOrder,
} from "@/lib/features/products/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Star, ShoppingCart, Search } from "lucide-react";

/**
 * Example component demonstrating Redux API usage with RTK Query
 * This shows how to call APIs using Redux in your ecommerce project
 */
export default function ReduxApiExample() {
  const dispatch = useDispatch<AppDispatch>();
  
  // ===== REDUX STATE SELECTORS =====
  const currentFilters = useSelector(selectCurrentFilters);
  const pagination = useSelector(selectPagination);
  const searchQuery = useSelector(selectSearchQuery);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);

  // ===== LOCAL STATE =====
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  // ===== REDUX API QUERIES =====
  
  // Get all products with filters
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useGetProductsQuery(currentFilters);

  // Get single product
  const {
    data: singleProductData,
    error: singleProductError,
    isLoading: isLoadingSingleProduct,
  } = useGetSingleProductQuery(selectedProductId, {
    skip: !selectedProductId, // Skip query if no product ID
  });

  // Get new arrivals
  const {
    data: newArrivalsData,
    isLoading: isLoadingNewArrivals,
  } = useGetNewArrivalsQuery({ limit: 5 });

  // Get top selling products
  const {
    data: topSellingData,
    isLoading: isLoadingTopSelling,
  } = useGetTopSellingProductsQuery({ limit: 5 });

  // Get products by category
  const {
    data: categoryProductsData,
    isLoading: isLoadingCategoryProducts,
  } = useGetProductsByCategoryQuery({
    categoryId: "electronics", // Example category
    filters: { limit: 10 },
  });

  // Get wishlist
  const {
    data: wishlistData,
    isLoading: isLoadingWishlist,
    refetch: refetchWishlist,
  } = useGetWishlistQuery({});

  // ===== REDUX API MUTATIONS =====
  
  const [createReview, { isLoading: isCreatingReview }] = useCreateProductReviewMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const [trackView, { isLoading: isTrackingView }] = useTrackProductViewMutation();

  // ===== EVENT HANDLERS =====

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(updateFilters({ search: query }));
  };

  const handleSortChange = (newSortBy: string) => {
    dispatch(setSortBy(newSortBy));
    dispatch(updateFilters({ sortBy: newSortBy as any }));
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    dispatch(setSortOrder(newSortOrder));
    dispatch(updateFilters({ sortOrder: newSortOrder }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(updateFilters({ page }));
  };

  const handlePriceFilter = (min: number, max: number) => {
    dispatch(updateFilters({ minPrice: min, maxPrice: max }));
  };

  const handleCategoryFilter = (category: string) => {
    dispatch(updateFilters({ categories: [category] }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleCreateReview = async () => {
    if (!selectedProductId || !reviewData.title || !reviewData.comment) return;

    try {
      await createReview({
        productId: selectedProductId,
        ...reviewData,
      }).unwrap();
      
      setReviewData({ rating: 5, title: "", comment: "" });
      alert("Review created successfully!");
    } catch (error) {
      console.error("Failed to create review:", error);
      alert("Failed to create review");
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      await addToWishlist({
        productId,
        priority: 'medium',
      }).unwrap();
      
      refetchWishlist();
      alert("Added to wishlist!");
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      alert("Failed to add to wishlist");
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      
      refetchWishlist();
      alert("Removed from wishlist!");
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      alert("Failed to remove from wishlist");
    }
  };

  const handleTrackView = async (productId: string) => {
    try {
      await trackView(productId).unwrap();
      console.log("Product view tracked");
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  // ===== RENDER HELPERS =====

  const renderProductCard = (product: any, showActions: boolean = true) => (
    <Card key={product.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.title}</CardTitle>
          <Badge variant="secondary">${product.price}</Badge>
        </div>
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{product.rating}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        
        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setSelectedProductId(product.id)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddToWishlist(product.id)}
              disabled={isAddingToWishlist}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTrackView(product.id)}
              disabled={isTrackingView}
            >
              Track View
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingState = (message: string) => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );

  const renderErrorState = (error: any, message: string) => (
    <div className="text-center p-8 text-red-600">
      <p>{message}</p>
      <p className="text-sm text-gray-500 mt-2">
        {error?.data?.message || error?.message || "Unknown error"}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Redux API Example</h1>
        <p className="text-gray-600">
          Demonstrating how to call APIs using Redux with RTK Query
        </p>
      </div>

      {/* ===== SEARCH AND FILTERS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="ml-2 px-3 py-1 border rounded"
              >
                <option value="popularity">Popularity</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="createdAt">Newest</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                className="ml-2 px-3 py-1 border rounded"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <Button
              onClick={() => handlePriceFilter(0, 100)}
              variant="outline"
              size="sm"
            >
              Under $100
            </Button>

            <Button
              onClick={() => handleCategoryFilter("electronics")}
              variant="outline"
              size="sm"
            >
              Electronics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== MAIN PRODUCTS LIST ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <p className="text-sm text-gray-600">
            Total: {pagination.totalProducts} products
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            renderLoadingState("Loading products...")
          ) : productsError ? (
            renderErrorState(productsError, "Failed to load products")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsData?.data?.map((product) => renderProductCard(product))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== NEW ARRIVALS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>New Arrivals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingNewArrivals ? (
            renderLoadingState("Loading new arrivals...")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {newArrivalsData?.data?.map((product) => renderProductCard(product, false))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== TOP SELLING ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTopSelling ? (
            renderLoadingState("Loading top selling products...")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topSellingData?.data?.map((product) => renderProductCard(product, false))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== WISHLIST ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Wishlist</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWishlist ? (
            renderLoadingState("Loading wishlist...")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistData?.data?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{item.product?.title}</h3>
                    <p className="text-sm text-gray-600">${item.product?.price}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    disabled={isRemovingFromWishlist}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== SINGLE PRODUCT DETAILS ===== */}
      {selectedProductId && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSingleProduct ? (
              renderLoadingState("Loading product details...")
            ) : singleProductError ? (
              renderErrorState(singleProductError, "Failed to load product details")
            ) : singleProductData?.data ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{singleProductData.data.title}</h2>
                <p className="text-gray-600">{singleProductData.data.description}</p>
                <p className="text-xl font-semibold">${singleProductData.data.price}</p>
                
                {/* Review Form */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Add Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <select
                        value={reviewData.rating}
                        onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                        className="px-3 py-2 border rounded"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={reviewData.title}
                        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                        placeholder="Review title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        placeholder="Your review comment"
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
                      />
                    </div>
                    
                    <Button
                      onClick={handleCreateReview}
                      disabled={isCreatingReview || !reviewData.title || !reviewData.comment}
                    >
                      {isCreatingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating Review...
                        </>
                      ) : (
                        "Create Review"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* ===== DEBUG INFO ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Current Filters:</strong> {JSON.stringify(currentFilters, null, 2)}</p>
            <p><strong>Pagination:</strong> {JSON.stringify(pagination, null, 2)}</p>
            <p><strong>Search Query:</strong> {searchQuery}</p>
            <p><strong>Sort By:</strong> {sortBy}</p>
            <p><strong>Sort Order:</strong> {sortOrder}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
