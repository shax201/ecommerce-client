"use client"

import ProductForm from "../ProductForm"


export default function AddProductPage() {
  return (
    <div className="w-full py-10 ">
      <h1 className="text-3xl font-bold mb-6 mx-5">Add Product</h1>
      <ProductForm mode="add" />
    </div>
  )
} 