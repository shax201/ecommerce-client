"use server";

export interface CategoryFormData {
  name: string;
  description: string;
  parentCategory?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Note: These server actions are now primarily used for server-side operations
// For client-side operations, use the Redux RTK Query mutations instead:
// - useCreateCategoryMutation
// - useUpdateCategoryMutation
// - useDeleteCategoryMutation

// DEPRECATED: Use Redux RTK Query hooks instead
// Import and use these hooks in your components:
// import { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/lib/features/categories'

export async function createCategory(
  formData: CategoryFormData
): Promise<CategoryResponse> {
  // Validate required fields
  if (!formData.name?.trim()) {
    return { success: false, message: "Category name is required." };
  }

  if (!formData.description?.trim()) {
    return { success: false, message: "Category description is required." };
  }

  try {
    const payload = {
      title: formData.name.trim(),
      description: formData.description.trim(),
      parent: formData.parentCategory?.trim() || null,
    };

    const response = await fetch(`${process.env.BACKEND_URL}/category/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: "Category created successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create category.",
      };
    }
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: "An error occurred while creating the category.",
    };
  }
}

export async function updateCategory(
  categoryId: string,
  formData: CategoryFormData
): Promise<CategoryResponse> {
  // Validate required fields
  if (!formData.name?.trim()) {
    return { success: false, message: "Category name is required." };
  }

  if (!formData.description?.trim()) {
    return { success: false, message: "Category description is required." };
  }

  try {
    const payload = {
      title: formData.name.trim(),
      description: formData.description.trim(),
      parent: formData.parentCategory?.trim() || null,
    };

    const response = await fetch(`${process.env.BACKEND_URL}/category/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: "Category updated successfully!",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update category.",
      };
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: "An error occurred while updating the category.",
    };
  }
}
