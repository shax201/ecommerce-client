"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SimpleEditor } from "@/components/text-editor/tiptap-templates/simple/simple-editor"
import { useActionState } from "react"
import { createProduct } from "./products-data"
import { fetchCategories } from "../categories/categories-data"
import { CategoryData } from "../categories/categroy.interface"
import { toast } from "sonner"

const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  sku: z.string().min(1, "SKU is required"),
  primaryImage: z.any().refine((file) => file && file.length === 1, "Primary image is required"),
  optionalImage: z.any().optional(),
  regularPrice: z.number().min(0, "Regular price is required"),
  discountedPrice: z.number().min(0, "Discounted price is required"),
  videoLink: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

type ActionState = { error?: string; success?: boolean }

type ProductFormProps = {
  mode: "add" | "edit"
  initialValues?: Partial<ProductFormValues>
  mockProduct?: ProductFormValues
}

const initialSteps = [
  { label: "Basic Info", done: false },
  { label: "Images", done: false },
  { label: "Pricing", done: false },
  { label: "Category", done: false },
  { label: "Description", done: false },
]

export default function ProductForm({ mode, initialValues, mockProduct }: ProductFormProps) {
  const [steps, setSteps] = useState(initialSteps)
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null)
  const [optionalImagePreview, setOptionalImagePreview] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get default values from props
  const defaultVals = mode === "edit" && mockProduct ? mockProduct : initialValues || {}

  // For controlled fields (category, description)
  const [category, setCategory] = useState(defaultVals.category || "")
  const [description, setDescription] = useState(defaultVals.description || "")

  // Form values state for step tracking
  const [formValues, setFormValues] = useState({
    title: defaultVals.title || "",
    sku: defaultVals.sku || "",
    primaryImage: false, // Will be updated based on prefilled data
    regularPrice: defaultVals.regularPrice || 0,
    discountedPrice: defaultVals.discountedPrice || 0,
  })

  const [color, setColor] = useState<string[]>([])
  const [size, setSize] = useState<string[]>([])
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>("")
  const [optionalImages, setOptionalImages] = useState<string[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  // Helper function to strip HTML tags and get plain text length
  const getPlainTextLength = (htmlString: string): number => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlString
    return (tempDiv.textContent || tempDiv.innerText || '').trim().length
  }

  // Update steps based on form completion
  const updateSteps = (newFormValues: typeof formValues, newCategory: string, newDescription: string) => {
    const updatedSteps = [...steps]
    
    // Step 1: Basic Info (title + sku)
    updatedSteps[0].done = !!(newFormValues.title.trim() && newFormValues.sku.trim())
    
    // Step 2: Images (at least primary image)
    updatedSteps[1].done = newFormValues.primaryImage
    
    // Step 3: Pricing (only regular price required)
    updatedSteps[2].done = !!(newFormValues.regularPrice > 0)
    
    // Step 4: Category
    updatedSteps[3].done = !!newCategory.trim()
    
    // Step 5: Description (check plain text length, not HTML)
    const plainTextLength = getPlainTextLength(newDescription)
    updatedSteps[4].done = plainTextLength >= 10
    
    setSteps(updatedSteps)
  }

  // Initialize step tracking on component mount and when props change
  useEffect(() => {
    const initialFormValues = {
      title: defaultVals.title || "",
      sku: defaultVals.sku || "",
      primaryImage: !!(defaultVals.primaryImage || (mode === "edit" && mockProduct?.primaryImage)),
      regularPrice: defaultVals.regularPrice || 0,
      discountedPrice: defaultVals.discountedPrice || 0,
    }
    
    const initialCategory = defaultVals.category || ""
    const initialDescription = defaultVals.description || ""
    
    setFormValues(initialFormValues)
    setCategory(initialCategory)
    setDescription(initialDescription)
    setSelectedCategory(initialCategory) // Initialize selectedCategory
    
    // Update steps based on prefilled data
    updateSteps(initialFormValues, initialCategory, initialDescription)
  }, [mode, initialValues, mockProduct])

  // Action function for useActionState
  async function productAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    // Instead of using zod, use the new fields and call createProduct
    const title = formData.get("title") as string
    const sku = formData.get("sku") as string // not used in API
    const description = formData.get("description") as string
    const primaryImage = formData.get("primaryImageUrl") as string
    const optionalImagesStr = formData.get("optionalImages") as string
    const regularPrice = Number(formData.get("regularPrice"))
    const discountPrice = Number(formData.get("discountedPrice"))
    const videoLink = formData.get("videoLink") as string
    const catagory = formData.getAll("category").filter(Boolean) as string[]
    const colorStr = formData.get("color") as string
    const sizeStr = formData.get("size") as string

    if (!title || !primaryImage || !regularPrice || !catagory.length) {
      return { error: "Title, primary image, price, and category are required.", success: false }
    }

    const payload = {
      title,
      description,
      primaryImage,
      optionalImages: optionalImagesStr ? optionalImagesStr.split(",").map((url) => url.trim()).filter(Boolean) : [],
      regularPrice,
      discountPrice,
      videoLink,
      catagory: selectedCategory ? [selectedCategory] : [],
      color: colorStr ? colorStr.split(",").map((c) => c.trim()).filter(Boolean) : [],
      size: sizeStr ? sizeStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
    }

    const result = await createProduct(payload)
    if (result) {
      return { success: true, error: undefined }
    } else {
      return { error: "Failed to create product.", success: false }
    }
  }

  const [actionState, formAction, isPending] = useActionState<ActionState, FormData>(productAction, { error: undefined, success: false })

  useEffect(() => {
    if (actionState.success) {
      toast.success(mode === "add" ? "Product added successfully!" : "Product updated successfully!")
    }
  }, [actionState.success, mode])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "primary" | "optional") => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (type === "primary") {
        setPrimaryImagePreview(url)
        const newFormValues = { ...formValues, primaryImage: true }
        setFormValues(newFormValues)
        updateSteps(newFormValues, category, description)
      } else {
        setOptionalImagePreview(url)
      }
    }
  }

  // Handle input changes for step tracking
  const handleInputChange = (field: string, value: string | number) => {
    const newFormValues = { ...formValues, [field]: value }
    setFormValues(newFormValues)
    updateSteps(newFormValues, category, description)
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setSelectedCategory(value)
    updateSteps(formValues, value, description)
  }

  // Handle description change with proper tracking
  const handleDescriptionChange = (content: string) => {
    setDescription(content)
    updateSteps(formValues, category, content)
  }

  // Add color and size input handlers
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value.split(",").map((c) => c.trim()).filter(Boolean))
  }
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
  }
  const handlePrimaryImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryImageUrl(e.target.value)
  }
  const handleOptionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionalImages(e.target.value.split(",").map((url) => url.trim()).filter(Boolean))
  }

  return (
    <div className="w-full px-5">
      {/* Todo List Steps */}
      <ol className="flex flex-wrap mb-8 gap-2 sm:gap-4">
        {steps.map((step, idx) => (
          <li key={step.label} className={`flex items-center ${step.done ? "text-green-600" : idx <= steps.findIndex(s => !s.done) ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`rounded-full w-6 h-6 flex items-center justify-center border text-xs ${
              step.done 
                ? "bg-green-600 text-white border-green-600" 
                : idx <= steps.findIndex(s => !s.done) 
                  ? "bg-primary text-white border-primary" 
                  : "bg-muted border-muted-foreground"
            }`}>
              {step.done ? "✓" : idx + 1}
            </span>
            <span className="ml-2 text-sm font-medium">{step.label}</span>
            {idx < steps.length - 1 && <span className="mx-2 hidden sm:inline">→</span>}
          </li>
        ))}
      </ol>
      
      <form action={formAction} className="w-full space-y-6">
        {/* Product Title and SKU Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Label htmlFor="title">Product Title</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="Enter product title" 
              defaultValue={formValues.title} 
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full" 
            />
          </div>
          <div className="w-full">
            <Label htmlFor="sku">Product SKU</Label>
            <Input 
              id="sku" 
              name="sku" 
              placeholder="Enter SKU" 
              defaultValue={formValues.sku} 
              onChange={(e) => handleInputChange("sku", e.target.value)}
              className="w-full" 
            />
          </div>
        </div>

        {/* Primary Image URL and Optional Images URLs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Label htmlFor="primaryImageUrl">Primary Image URL</Label>
            <Input id="primaryImageUrl" name="primaryImageUrl" type="url" placeholder="https://..." onChange={handlePrimaryImageUrlChange} className="w-full" />
          </div>
          <div className="w-full">
            <Label htmlFor="optionalImages">Optional Images URLs (comma separated)</Label>
            <Input id="optionalImages" name="optionalImages" type="text" placeholder="https://img1.jpg, https://img2.jpg" onChange={handleOptionalImagesChange} className="w-full" />
          </div>
        </div>

        {/* Color and Size Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Label htmlFor="color">Colors (comma separated)</Label>
            <Input id="color" name="color" type="text" placeholder="Red, Blue" onChange={handleColorChange} className="w-full" />
          </div>
          <div className="w-full">
            <Label htmlFor="size">Sizes (comma separated)</Label>
            <Input id="size" name="size" type="text" placeholder="M, L" onChange={handleSizeChange} className="w-full" />
          </div>
        </div>

        {/* Regular Price and Discounted Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Label htmlFor="regularPrice">Regular Price</Label>
            <Input 
              id="regularPrice" 
              name="regularPrice" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              defaultValue={formValues.regularPrice || ""} 
              onChange={(e) => handleInputChange("regularPrice", parseFloat(e.target.value) || 0)}
              className="w-full" 
            />
          </div>
          <div className="w-full">
            <Label htmlFor="discountedPrice">Discounted Price</Label>
            <Input 
              id="discountedPrice" 
              name="discountedPrice" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              defaultValue={formValues.discountedPrice || ""} 
              onChange={(e) => handleInputChange("discountedPrice", parseFloat(e.target.value) || 0)}
              className="w-full" 
            />
          </div>
        </div>

        {/* Video Link and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <Label htmlFor="videoLink">Video Link (optional)</Label>
            <Input id="videoLink" name="videoLink" placeholder="https://..." defaultValue={defaultVals.videoLink} className="w-full" />
          </div>
          <div className="w-full">
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={selectedCategory} />
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="w-full">
          <Label htmlFor="description">Description</Label>
          <div className="mt-1 text-sm md:text-l text-muted-foreground">
            {getPlainTextLength(description)} characters (minimum 10 required)
          </div>
          <SimpleEditor 
            initialContent={description} 
            onContentChange={handleDescriptionChange}
          />
          <input type="hidden" name="description" value={description} />
          {/* Show character count for description */}
          
        </div>

        {/* Error and Success Messages */}
        {actionState.error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md border border-red-200">{actionState.error}</div>}
        {actionState.success && (
          <div className="text-green-600 text-sm p-3 bg-green-50 rounded-md border border-green-200">
            {mode === "add" ? "Product added successfully!" : "Product updated successfully!"}
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Product" : "Update Product")}
        </Button>
      </form>
    </div>
  )
}