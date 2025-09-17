"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductPagination, { CompactPagination } from "@/components/common/ProductPagination";
import { usePagination, useUrlPagination, useApiPagination } from "@/hooks/usePagination";
import { useGetProductsQuery } from "@/lib/features/products/productApi";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Settings,
  Code,
  Play
} from "lucide-react";

/**
 * PaginationExamples component showing different pagination implementations
 */
export default function PaginationExamples() {
  const [activeExample, setActiveExample] = useState("basic");

  // Mock data for examples
  const mockData = Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 1000) + 10,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pagination Examples</h1>
        <p className="text-gray-600">
          Different ways to implement pagination in your ecommerce app
        </p>
      </div>

      {/* Example Selector */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {[
          { id: "basic", label: "Basic Pagination", icon: Play },
          { id: "url", label: "URL Pagination", icon: Code },
          { id: "api", label: "API Pagination", icon: Settings },
          { id: "compact", label: "Compact Pagination", icon: ChevronLeft },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeExample === id ? "default" : "outline"}
            onClick={() => setActiveExample(id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Basic Pagination Example */}
      {activeExample === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Pagination Hook</CardTitle>
            <p className="text-sm text-gray-600">
              Simple pagination using the usePagination hook with mock data
            </p>
          </CardHeader>
          <CardContent>
            <BasicPaginationExample data={mockData} />
          </CardContent>
        </Card>
      )}

      {/* URL Pagination Example */}
      {activeExample === "url" && (
        <Card>
          <CardHeader>
            <CardTitle>URL-based Pagination</CardTitle>
            <p className="text-sm text-gray-600">
              Pagination that syncs with URL parameters for bookmarkable pages
            </p>
          </CardHeader>
          <CardContent>
            <UrlPaginationExample data={mockData} />
          </CardContent>
        </Card>
      )}

      {/* API Pagination Example */}
      {activeExample === "api" && (
        <Card>
          <CardHeader>
            <CardTitle>API-based Pagination</CardTitle>
            <p className="text-sm text-gray-600">
              Pagination with real API data and loading states
            </p>
          </CardHeader>
          <CardContent>
            <ApiPaginationExample />
          </CardContent>
        </Card>
      )}

      {/* Compact Pagination Example */}
      {activeExample === "compact" && (
        <Card>
          <CardHeader>
            <CardTitle>Compact Pagination</CardTitle>
            <p className="text-sm text-gray-600">
              Minimal pagination for mobile or space-constrained areas
            </p>
          </CardHeader>
          <CardContent>
            <CompactPaginationExample data={mockData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Basic Pagination Example Component
function BasicPaginationExample({ data }: { data: any[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const pagination = usePagination({
    totalItems: data.length,
    itemsPerPage,
    initialPage: 1,
  });

  const currentItems = data.slice(
    (pagination.currentPage - 1) * itemsPerPage,
    pagination.currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              pagination.setItemsPerPage(Number(e.target.value));
            }}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} items
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <ProductPagination
        pagination={pagination}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        showInfo={false}
        showJumpButtons={pagination.totalPages > 5}
      />
    </div>
  );
}

// URL Pagination Example Component
function UrlPaginationExample({ data }: { data: any[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const pagination = useUrlPagination({
    totalItems: data.length,
    itemsPerPage,
    initialPage: 1,
  });

  const currentItems = data.slice(
    (pagination.currentPage - 1) * itemsPerPage,
    pagination.currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">URL Sync</h4>
        <p className="text-sm text-blue-700">
          The current page is synced with the URL. Try changing the page and refreshing - 
          the page will be preserved!
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
        </p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <ProductPagination
        pagination={pagination}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        showInfo={true}
        showJumpButtons={true}
      />
    </div>
  );
}

// API Pagination Example Component
function ApiPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useGetProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">Real API Data</h4>
        <p className="text-sm text-green-700">
          This example uses real product data from your API with loading states and error handling.
        </p>
      </div>

      {/* Loading State */}
      {isLoadingProducts && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {productsError && (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load products</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoadingProducts && !productsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <div key={product.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{product.title || product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoadingProducts && !productsError && (
        <ProductPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoadingProducts}
          itemsPerPage={itemsPerPage}
          showInfo={true}
          showJumpButtons={pagination.totalPages > 5}
        />
      )}
    </div>
  );
}

// Compact Pagination Example Component
function CompactPaginationExample({ data }: { data: any[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const pagination = usePagination({
    totalItems: data.length,
    itemsPerPage,
    initialPage: 1,
  });

  const currentItems = data.slice(
    (pagination.currentPage - 1) * itemsPerPage,
    pagination.currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">Compact Design</h4>
        <p className="text-sm text-yellow-700">
          Perfect for mobile devices or when you need to save space.
        </p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.price}</p>
          </div>
        ))}
      </div>

      {/* Compact Pagination */}
      <CompactPagination
        pagination={pagination}
        onPageChange={pagination.goToPage}
        isLoading={false}
      />
    </div>
  );
}
