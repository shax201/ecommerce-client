"use client";

import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/lib/features/products/productApi";
import { useGetColorsQuery } from "@/lib/features/attributes/colorsApi";
import { useGetSizesQuery } from "@/lib/features/attributes/sizesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, RefreshCw } from "lucide-react";

/**
 * Filter Test Page
 * Test page to verify that product filtering is working correctly
 */
export default function FilterTestPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    colors: undefined as string[] | undefined,
    sizes: undefined as string[] | undefined,
    categories: undefined as string[] | undefined,
  });

  // Fetch products with current filters
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useGetProductsQuery(filters);

  // Fetch available colors and sizes
  const { data: colorsData } = useGetColorsQuery();
  const { data: sizesData } = useGetSizesQuery();

  const products = productsData?.data || [];
  const colors = colorsData?.data || [];
  const sizes = sizesData?.data || [];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      minPrice: undefined,
      maxPrice: undefined,
      colors: undefined,
      sizes: undefined,
      categories: undefined,
    });
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
            <Filter className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Filter Test Page</h1>
          </div>
          <p className="text-lg text-gray-600">
            Test page to verify that product filtering is working correctly with the API.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                      <input
                        type="number"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="font-semibold mb-3">Colors</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {colors.map((color) => (
                      <label key={color._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.colors?.includes(color.color.toLowerCase()) || false}
                          onChange={(e) => {
                            const currentColors = filters.colors || [];
                            const newColors = e.target.checked
                              ? [...currentColors, color.color.toLowerCase()]
                              : currentColors.filter(c => c !== color.color.toLowerCase());
                            handleFilterChange('colors', newColors.length > 0 ? newColors : undefined);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{color.color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="font-semibold mb-3">Sizes</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sizes.map((size) => (
                      <label key={size._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.sizes?.includes(size.size) || false}
                          onChange={(e) => {
                            const currentSizes = filters.sizes || [];
                            const newSizes = e.target.checked
                              ? [...currentSizes, size.size]
                              : currentSizes.filter(s => s !== size.size);
                            handleFilterChange('sizes', newSizes.length > 0 ? newSizes : undefined);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{size.size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={isLoadingProducts}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoadingProducts ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Display */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {products.length} products
                    </Badge>
                    {isLoadingProducts && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Current Filters Display */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.minPrice && (
                      <Badge variant="outline">Min: ${filters.minPrice}</Badge>
                    )}
                    {filters.maxPrice && (
                      <Badge variant="outline">Max: ${filters.maxPrice}</Badge>
                    )}
                    {filters.colors?.map((color) => (
                      <Badge key={color} variant="outline">Color: {color}</Badge>
                    ))}
                    {filters.sizes?.map((size) => (
                      <Badge key={size} variant="outline">Size: {size}</Badge>
                    ))}
                    {filters.categories?.map((category) => (
                      <Badge key={category} variant="outline">Category: {category}</Badge>
                    ))}
                  </div>
                </div>

                {/* API Call Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">API Call Info:</h4>
                  <pre className="text-sm text-blue-800 overflow-x-auto">
                    {JSON.stringify(filters, null, 2)}
                  </pre>
                </div>

                {/* Products Grid */}
                {isLoadingProducts ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading products...</p>
                  </div>
                ) : productsError ? (
                  <div className="text-center py-8 text-red-600">
                    <p>Error loading products</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {productsError && 'data' in productsError && productsError.data && typeof productsError.data === 'object' && 'message' in productsError.data
                        ? (productsError.data as any).message
                        : 'Unknown error occurred'}
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No products found with current filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{product.title || product.name}</h3>
                        <p className="text-gray-600">${product.price}</p>
                        {product.colors && (
                          <p className="text-sm text-gray-500">Colors: {product.colors.join(', ')}</p>
                        )}
                        {product.sizes && (
                          <p className="text-sm text-gray-500">Sizes: {product.sizes.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
