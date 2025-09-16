import { CategoryData, CategoryWithSubCategories } from "./categroy.interface"

export async function fetchCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      const data = await response.json()
      if (response.ok && data.success) {
        return data.data
      } else {
        console.error("Failed to fetch categories:", data.message)
        return []
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

export async function fetchProductsByCategory(categoryId: string): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/category/${categoryId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      const data = await response.json()
  
      if (response.ok && data.success) {
        return data.data
      } else {
        return []
      }
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error)
      return []
    }
  }
export async function deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      const data = await response.json()
  
      if (response.ok && data.success) {
        return true
      } else {
        console.error("Failed to delete category:", data.message)
        return false
      }
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error)
      return false
    }
  }

