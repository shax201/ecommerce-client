"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createCategory, updateCategory } from "@/actions/category"
import { CategoryData } from "@/app/(admin)/categories/categroy.interface"

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editMode?: boolean
  categoryToEdit?: CategoryData | null
  categories?: CategoryData[] // Add categories prop
}

export function AddCategoryDialog({ 
  open, 
  onOpenChange, 
  editMode = false, 
  categoryToEdit = null,
  categories = [] // Default to empty array
}: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form data when editing
  useEffect(() => {
    if (editMode && categoryToEdit) {
      setFormData({
        name: categoryToEdit.title,
        description: categoryToEdit.description,
        parentCategory: categoryToEdit.parent || "none",
      })
    } else {
      // Reset form when creating new category
      setFormData({
        name: "",
        description: "",
        parentCategory: "none",
      })
    }
  }, [editMode, categoryToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert "none" back to empty string for server
      const submitData = {
        ...formData,
        parentCategory: formData.parentCategory === "none" ? "" : formData.parentCategory
      }

      let result

      if (editMode && categoryToEdit) {
        result = await updateCategory(categoryToEdit._id, submitData)
      } else {
        result = await createCategory(submitData)
      }

      if (result.success) {
        toast.success(editMode ? "Category Updated" : "Category Added", {
          description: result.message,
        })

        // Reset form and close dialog
        setFormData({
          name: "",
          description: "",
          parentCategory: "",
        })
        onOpenChange(false)
      } else {
        toast.error(editMode ? "Failed to update category" : "Failed to add category", {
          description: result.message,
        })
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Filter out categories that would create circular references when editing
  const getAvailableParentCategories = () => {
    if (!editMode) {
      // When creating new category, show all categories as potential parents
      return categories.filter(cat => !cat.parent) // Only show parent categories
    } else {
      // When editing, exclude the current category and its descendants
      const excludeIds = new Set([categoryToEdit?._id])
      
      // Add all sub-categories of the current category to exclude list
      const addDescendants = (categoryId: string) => {
        categories.forEach(cat => {
          if (cat.parent === categoryId) {
            excludeIds.add(cat._id)
            addDescendants(cat._id)
          }
        })
      }
      
      if (categoryToEdit?._id) {
        addDescendants(categoryToEdit._id)
      }
      
      return categories.filter(cat => !excludeIds.has(cat._id) && !cat.parent)
    }
  }

  const availableParentCategories = getAvailableParentCategories()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Update the category information below."
              : "Create a new category to organize your products. Provide a clear name and description."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Name *
              </Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="col-span-3"
                placeholder="e.g., Electronics"
                required
                disabled={isSubmitting}
              />
            </div>
            {availableParentCategories.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent-category" className="text-right">
                  Parent Category
                </Label>
                <Select
                  value={formData.parentCategory}
                  onValueChange={(value) => handleInputChange("parentCategory", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a parent category (optional)" />
                  </SelectTrigger>
                                  <SelectContent>
                  <SelectItem value="none">No parent category</SelectItem>
                  {availableParentCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="category-description" className="text-right pt-2">
                Description *
              </Label>
              <Textarea
                id="category-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="col-span-3"
                placeholder="Brief description of the category..."
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (editMode ? "Updating..." : "Adding...") 
                : (editMode ? "Update Category" : "Add Category")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
