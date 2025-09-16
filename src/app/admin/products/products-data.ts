import { ProductData } from "./product.interface"

export async function fetchProducts(): Promise<ProductData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    if (response.ok && data.success) {
      return data.data
    } else {
      console.error("Failed to fetch products:", data.message)
      return []
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function fetchProductById(productId: string): Promise<ProductData | null> {
  // Validate productId format (MongoDB ObjectId should be 24 characters hexadecimal)
  if (!productId || typeof productId !== 'string' || productId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(productId)) {
    console.error("Invalid product ID format:", productId);
    return null;
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      return data.data
    } else {
      console.error("Failed to fetch product:", data.message)
      return null
    }
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error)
    return null
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return true
    } else {
      console.error("Failed to delete product:", data.message)
      return false
    }
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error)
    return false
  }
}

export interface CreateProductPayload {
  title: string
  description: string
  primaryImage: string
  optionalImages: string[]
  regularPrice: number
  discountPrice: number
  videoLink?: string
  catagory: string[]
  color: string[]
  size: string[]
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      return data.data
    } else {
      console.error("Failed to create product:", data.message)
      return null
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return null
  }
}
