"use client";

import React, { useState } from 'react';
import { useCreateCategoryMutation, useGetCategoriesQuery } from '@/lib/features/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface CategoryFormData {
  title: string;
  description: string;
  parent?: string | null;
}

export default function CategoryCreateExample() {
  const [formData, setFormData] = useState<CategoryFormData>({
    title: '',
    description: '',
    parent: null,
  });

  // Redux RTK Query hooks
  const [createCategory, { isLoading: isCreating, error: createError, isSuccess: createSuccess }] = useCreateCategoryMutation();
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useGetCategoriesQuery();

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    try {
      const result = await createCategory({
        title: formData.title.trim(),
        description: formData.description.trim(),
        parent: formData.parent || null,
      }).unwrap();

      if (result.success) {
        // Reset form on success
        setFormData({
          title: '',
          description: '',
          parent: null,
        });
        console.log('Category created successfully:', result.data);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const parentCategories = categoriesData?.data?.filter(category => category.parent === null) || [];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Category with Redux RTK Query</CardTitle>
          <CardDescription>
            This example shows how to use the useCreateCategoryMutation hook from Redux RTK Query
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Category Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter category description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parent || ''}
                onValueChange={(value) => handleInputChange('parent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent category</SelectItem>
                  {isLoadingCategories ? (
                    <SelectItem value="" disabled>Loading categories...</SelectItem>
                  ) : (
                    parentCategories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Success Message */}
            {createSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Category created successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {createError && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {('data' in createError && createError.data && typeof createError.data === 'object' && 'message' in createError.data) 
                    ? (createError.data as { message: string }).message 
                    : 'Failed to create category. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Categories Error */}
            {categoriesError && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <XCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Failed to load parent categories. You can still create a category without a parent.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isCreating || !formData.title.trim() || !formData.description.trim()}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Category...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display existing categories */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            Categories fetched using useGetCategoriesQuery hook
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : categoriesData?.data ? (
            <div className="space-y-2">
              {categoriesData.data.map((category) => (
                <div key={category._id} className="p-3 border rounded-lg">
                  <div className="font-medium">{category.title}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                  {category.parent && (
                    <div className="text-xs text-blue-600">
                      Parent: {parentCategories.find(p => p._id === category.parent)?.title || 'Unknown'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No categories found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
