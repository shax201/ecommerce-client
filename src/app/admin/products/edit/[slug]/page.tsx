"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useGetSingleProductQuery } from "@/lib/features/products/productApi"
import ProductForm from "../../ProductForm"
import { BackButton } from "@/components/admin/back-button"

export default function EditProductPage() {
  const { slug } = useParams() as { slug: string }
  
  // Use Redux RTK Query hook
  const { 
    data: productData, 
    isLoading: loading, 
    error, 
    isError 
  } = useGetSingleProductQuery(slug, {
    skip: !slug // Skip query if no slug
  })

  console.log("Edit page slug:", slug)
  console.log("Product data:", productData)

  // Transform API data to form initial values
  const product = useMemo(() => {
    if (!productData?.data) return null
    
    const data = productData.data as any // Type assertion for API response
    return {
      title: data.title || "",
      sku: data.sku || "",
      primaryImage: data.primaryImage || "",
      optionalImage: data.optionalImages || [],
      regularPrice: data.regularPrice || 0,
      discountedPrice: data.discountPrice || 0,
      videoLink: data.videoLink || "",
      category: Array.isArray(data.catagory) && data.catagory.length > 0 ? data.catagory[0]._id : "",
      description: data.description || "",
      color: data.color || data.variants?.color || [],
      size: data.size || data.variants?.size || [],
    }
  }, [productData])

  if (loading) {
    return (
      <div className="w-full py-10">
        <div className="mx-5 mb-6">
          <BackButton href="/admin/products" className="mb-4" />
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (isError || error) {
    const errorMessage = error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data 
      ? (error.data as { message: string }).message 
      : 'Failed to load product'
    
    return (
      <div className="w-full py-10">
        <div className="mx-5 mb-6">
          <BackButton href="/admin/products" className="mb-4" />
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="text-center text-red-500">{errorMessage}</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full py-10">
        <div className="mx-5 mb-6">
          <BackButton href="/admin/products" className="mb-4" />
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="text-center">Product not found</div>
      </div>
    )
  }

  return (
    <div className="w-full py-10">
      <div className="mx-5 mb-6">
        <BackButton href="/admin/products" className="mb-4" />
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>
      <ProductForm mode="edit" initialValues={product} productId={slug} />
    </div>
  )
} 