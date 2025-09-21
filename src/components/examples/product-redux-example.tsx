"use client";

import React, { useState } from 'react';
import { 
  useGetSingleProductQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '@/lib/features/products/productApi';
import { useProductRedux } from '@/hooks/use-product-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

export default function ProductReduxExample() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    regularPrice: 0,
    discountPrice: 0,
    primaryImage: '',
  });

  // Redux RTK Query hooks
  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts 
  } = useGetProductsQuery({ page: 1, limit: 10 });

  const { 
    data: singleProductData, 
    isLoading: isLoadingSingle,
    error: singleProductError 
  } = useGetSingleProductQuery(selectedProductId, {
    skip: !selectedProductId
  });

  // Custom Redux hook
  const { 
    product: customProduct,
    loading: customLoading,
    error: customError,
    isError: customIsError,
    performanceMetrics,
    refetch: customRefetch
  } = useProductRedux({ 
    productId: selectedProductId,
    skip: !selectedProductId
  });

  const [createProduct, { isLoading: isCreating, error: createError, isSuccess: createSuccess }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, error: updateError, isSuccess: updateSuccess }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting, error: deleteError, isSuccess: deleteSuccess }] = useDeleteProductMutation();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createProduct({
        title: formData.title,
        description: formData.description,
        regularPrice: formData.regularPrice,
        discountPrice: formData.discountPrice,
        primaryImage: formData.primaryImage,
        catagory: [],
        optionalImages: [],
        color: [],
        size: []
      }).unwrap();

      if (result.success) {
        console.log('Product created successfully:', result.data);
        setFormData({
          title: '',
          description: '',
          regularPrice: 0,
          discountPrice: 0,
          primaryImage: '',
        });
        setShowCreateForm(false);
        refetchProducts();
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (productId: string) => {
    try {
      const result = await updateProduct({
        id: productId,
        data: {
          title: formData.title || customProduct?.title,
          description: formData.description || customProduct?.description,
          regularPrice: formData.regularPrice || customProduct?.regularPrice,
          discountPrice: formData.discountPrice || customProduct?.discountPrice,
        }
      }).unwrap();

      if (result.success) {
        console.log('Product updated successfully:', result.data);
        refetchProducts();
        customRefetch();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await deleteProduct(productId).unwrap();
        
        if (result.success) {
          console.log('Product deleted successfully');
          refetchProducts();
          if (selectedProductId === productId) {
            setSelectedProductId('');
          }
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Redux RTK Query Example</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Cancel' : 'Create Product'}
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
            <CardDescription>Use Redux RTK Query to create a new product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter product title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryImage">Primary Image URL</Label>
                  <Input
                    id="primaryImage"
                    value={formData.primaryImage}
                    onChange={(e) => handleInputChange('primaryImage', e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price *</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    value={formData.regularPrice}
                    onChange={(e) => handleInputChange('regularPrice', Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => handleInputChange('discountPrice', Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Success/Error Messages */}
              {createSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Product created successfully!
                  </AlertDescription>
                </Alert>
              )}

              {createError && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {('data' in createError && createError.data && typeof createError.data === 'object' && 'message' in createError.data) 
                      ? (createError.data as { message: string }).message 
                      : 'Failed to create product. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
            <CardDescription>Fetched using useGetProductsQuery</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : productsError ? (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load products
                </AlertDescription>
              </Alert>
            ) : productsData?.data ? (
              <div className="space-y-2">
                {productsData.data.map((product: any) => (
                  <div key={product._id || product.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-600">${product.regularPrice}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProductId(product._id || product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product._id || product.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No products found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Single Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              {selectedProductId ? `Fetched using useProductRedux hook` : 'Select a product to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProductId ? (
              <div className="text-center py-4 text-gray-500">
                Click on a product to view details
              </div>
            ) : customLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading product details...</span>
              </div>
            ) : customError ? (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load product details
                </AlertDescription>
              </Alert>
            ) : customProduct ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{customProduct.title}</h3>
                  <p className="text-gray-600">{customProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Regular Price</Label>
                    <div className="text-lg font-semibold">${customProduct.regularPrice}</div>
                  </div>
                  <div>
                    <Label>Discount Price</Label>
                    <div className="text-lg font-semibold text-green-600">
                      ${customProduct.discountPrice || 'N/A'}
                    </div>
                  </div>
                </div>
                {customProduct.primaryImage && (
                  <div>
                    <Label>Primary Image</Label>
                    <img 
                      src={customProduct.primaryImage} 
                      alt={customProduct.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => customRefetch()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateProduct(selectedProductId)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Update
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Product not found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {selectedProductId && performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Redux RTK Query performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Cache Status</Label>
                <div className="text-gray-600">
                  {performanceMetrics.cacheStatus?.isCached ? 'Cached' : 'Not Cached'}
                </div>
              </div>
              <div>
                <Label>Data Completeness</Label>
                <div className="text-gray-600">
                  {performanceMetrics.dataCompleteness?.hasValidProduct ? 'Complete' : 'Incomplete'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Messages */}
      {updateSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Product updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {deleteSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Product deleted successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {updateError && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to update product
          </AlertDescription>
        </Alert>
      )}

      {deleteError && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to delete product
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}