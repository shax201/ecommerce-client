"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProductForm from "../../ProductForm"

export default function EditProductPage() {
  const { slug } = useParams() as { slug: string }
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${slug}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const apiData = await res.json()
        const data = apiData.data
        const initialValues = {
          title: data.title || "",
          sku: data.sku || "",
          primaryImage: data.primaryImage || "",
          optionalImage: data.optionalImages || [],
          regularPrice: data.regularPrice || 0,
          discountedPrice: data.discountPrice || 0,
          videoLink: data.videoLink || "",
          category: Array.isArray(data.catagory) && data.catagory.length > 0 ? data.catagory[0]._id : "",
          description: data.description || "",
          color: data.variants?.color || [],
          size: data.variants?.size || [],
        }
        setProduct(initialValues)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return <div className="w-full py-10 text-center">Loading...</div>
  }

  if (error) {
    return <div className="w-full py-10 text-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full py-10 ">
      <h1 className="text-3xl font-bold mb-6 mx-5">Edit Product</h1>
      <ProductForm mode="edit" initialValues={product} />
    </div>
  )
} 