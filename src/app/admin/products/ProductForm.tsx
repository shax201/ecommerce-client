"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SimpleEditor } from "@/components/text-editor/tiptap-templates/simple/simple-editor"
import { useActionState } from "react"
import { useCreateProductMutation, useUpdateProductMutation } from "@/lib/features/products/productApi"
import { fetchCategories } from "../categories/categories-data"
import { CategoryData } from "../categories/categroy.interface"
import { useGetColorsQuery, useGetSizesQuery, ColorData, SizeData } from "@/lib/features/attributes"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
  color: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

type ActionState = { error?: string; success?: boolean }

type ProductFormProps = {
  mode: "add" | "edit"
  initialValues?: Partial<ProductFormValues>
  mockProduct?: ProductFormValues
  productId?: string
}

const initialSteps = [
  { label: "Basic Info", done: false },
  { label: "Images", done: false },
  { label: "Pricing", done: false },
  { label: "Category", done: false },
  { label: "Description", done: false },
]

export default function ProductForm({ mode, initialValues, mockProduct, productId }: ProductFormProps) {
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

  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>("")
  const [optionalImages, setOptionalImages] = useState<string[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  
  // Multi-select dropdown states
  const [colorsOpen, setColorsOpen] = useState(false)
  const [sizesOpen, setSizesOpen] = useState(false)
  
  // Redux queries for colors and sizes
  const { data: colorsResponse, isLoading: colorsLoading } = useGetColorsQuery()
  const { data: sizesResponse, isLoading: sizesLoading } = useGetSizesQuery()
  
  // Redux mutations for creating and updating products
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation()
  
  const colors = colorsResponse?.data || []
  const sizes = sizesResponse?.data || []

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
    
    // Initialize colors and sizes for edit mode
    if (mode === "edit" && (defaultVals as any).color) {
      setSelectedColors(Array.isArray((defaultVals as any).color) ? (defaultVals as any).color : [])
    }
    if (mode === "edit" && (defaultVals as any).size) {
      setSelectedSizes(Array.isArray((defaultVals as any).size) ? (defaultVals as any).size : [])
    }
    
    // Set primary image URL for edit mode
    if (mode === "edit" && defaultVals.primaryImage) {
      setPrimaryImageUrl(defaultVals.primaryImage)
    }
    
    // Set optional images for edit mode
    if (mode === "edit" && defaultVals.optionalImage) {
      setOptionalImages(Array.isArray(defaultVals.optionalImage) ? defaultVals.optionalImage : [])
    }
    
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

    // Additional validation for description content
    const plainTextDescription = description.replace(/<[^>]*>/g, '').trim()
    
    if (!title || !sku || !description || !plainTextDescription || !primaryImage || !regularPrice || !catagory.length) {
      return { error: "Title, SKU, description (with content), primary image, price, and category are required.", success: false }
    }

    // Note: Color and size arrays can be empty - backend will handle validation

    const payload = {
      title,
      sku, // Include SKU in payload
      description,
      primaryImage,
      optionalImages: optionalImagesStr ? optionalImagesStr.split(",").map((url) => url.trim()).filter(Boolean) : [],
      regularPrice,
      discountPrice,
      videoLink,
      catagory: selectedCategory ? [selectedCategory] : [],
      color: selectedColors, // Use selected color IDs
      size: selectedSizes, // Use selected size IDs
    }

    // Debug: Log the payload to see what's being sent
    console.log("Product payload:", payload)

    try {
      let result
      if (mode === "edit" && productId) {
        // Update existing product
        result = await updateProduct({ id: productId, data: payload }).unwrap()
      } else {
        // Create new product
        result = await createProduct(payload).unwrap()
      }
      
      if (result.success) {
        return { success: true, error: undefined }
      } else {
        return { error: result.message || `Failed to ${mode} product.`, success: false }
      }
    } catch (error: any) {
      console.error(`Error ${mode === "edit" ? "updating" : "creating"} product:`, error)
      return { 
        error: error?.data?.message || error?.message || `Failed to ${mode} product.`, 
        success: false 
      }
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

  // Handle color selection
  const handleColorToggle = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    )
  }

  // Handle size selection
  const handleSizeToggle = (sizeId: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId) 
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    )
  }

  // Remove selected color
  const removeColor = (colorId: string) => {
    setSelectedColors(prev => prev.filter(id => id !== colorId))
  }

  // Remove selected size
  const removeSize = (sizeId: string) => {
    setSelectedSizes(prev => prev.filter(id => id !== sizeId))
  }

  // Get selected color names for display
  const getSelectedColorNames = () => {
    return selectedColors.map(colorId => {
      const color = colors.find(c => c._id === colorId)
      return color ? color.color : colorId
    })
  }

  // Get selected size names for display
  const getSelectedSizeNames = () => {
    return selectedSizes.map(sizeId => {
      const size = sizes.find(s => s._id === sizeId)
      return size ? size.size : sizeId
    })
  }

  // Get color preview style
  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'orange': '#f97316',
      'brown': '#a16207',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'navy': '#1e3a8a',
      'maroon': '#991b1b',
      'olive': '#65a30d',
      'lime': '#84cc16',
      'aqua': '#06b6d4',
      'teal': '#14b8a6',
      'silver': '#cbd5e1',
      'gold': '#fbbf24',
      'indigo': '#6366f1',
      'cyan': '#06b6d4',
      'amber': '#f59e0b'
    }
    
    const normalizedColor = color.toLowerCase().trim()
    return colorMap[normalizedColor] || normalizedColor
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
            <Input id="primaryImageUrl" name="primaryImageUrl" type="url" placeholder="https://..." value={primaryImageUrl} onChange={handlePrimaryImageUrlChange} className="w-full" />
          </div>
          <div className="w-full">
            <Label htmlFor="optionalImages">Optional Images URLs (comma separated)</Label>
            <Input id="optionalImages" name="optionalImages" type="text" placeholder="https://img1.jpg, https://img2.jpg" value={optionalImages.join(", ")} onChange={handleOptionalImagesChange} className="w-full" />
          </div>
        </div>

        {/* Color and Size Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors Multi-Select */}
          <div className="w-full">
            <Label>Colors</Label>
            <div className="mt-2 space-y-2">
              <Popover open={colorsOpen} onOpenChange={setColorsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={colorsOpen}
                    className="w-full justify-between"
                  >
                    {selectedColors.length === 0
                      ? "Select colors..."
                      : `${selectedColors.length} color${selectedColors.length === 1 ? '' : 's'} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-3">
                    <div className="space-y-2">
                      {colorsLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-4">Loading colors...</div>
                      ) : colors.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No colors available. <a href="/admin/attributes/colors" className="text-primary hover:underline">Add colors</a>
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {colors.map((color) => (
                            <div key={color._id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                              <Checkbox
                                id={`color-${color._id}`}
                                checked={selectedColors.includes(color._id)}
                                onCheckedChange={() => handleColorToggle(color._id)}
                              />
                              <Label 
                                htmlFor={`color-${color._id}`} 
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-gray-200"
                                  style={{ backgroundColor: getColorStyle(color.color) }}
                                />
                                <span className="text-sm">{color.color}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Selected Colors Display */}
              {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedColors.map((colorId) => {
                    const color = colors.find(c => c._id === colorId)
                    return color ? (
                      <Badge key={colorId} variant="secondary" className="flex items-center gap-1 pr-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getColorStyle(color.color) }}
                        />
                        {color.color}
                        <button
                          type="button"
                          onClick={() => removeColor(colorId)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sizes Multi-Select */}
          <div className="w-full">
            <Label>Sizes</Label>
            <div className="mt-2 space-y-2">
              <Popover open={sizesOpen} onOpenChange={setSizesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sizesOpen}
                    className="w-full justify-between"
                  >
                    {selectedSizes.length === 0
                      ? "Select sizes..."
                      : `${selectedSizes.length} size${selectedSizes.length === 1 ? '' : 's'} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-3">
                    <div className="space-y-2">
                      {sizesLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-4">Loading sizes...</div>
                      ) : sizes.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No sizes available. <a href="/admin/attributes/sizes" className="text-primary hover:underline">Add sizes</a>
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {sizes.map((size) => (
                            <div key={size._id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                              <Checkbox
                                id={`size-${size._id}`}
                                checked={selectedSizes.includes(size._id)}
                                onCheckedChange={() => handleSizeToggle(size._id)}
                              />
                              <Label 
                                htmlFor={`size-${size._id}`} 
                                className="cursor-pointer flex-1 text-sm"
                              >
                                {size.size}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Selected Sizes Display */}
              {selectedSizes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSizes.map((sizeId) => {
                    const size = sizes.find(s => s._id === sizeId)
                    return size ? (
                      <Badge key={sizeId} variant="secondary" className="flex items-center gap-1 pr-1">
                        {size.size}
                        <button
                          type="button"
                          onClick={() => removeSize(sizeId)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
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
        <Button type="submit" className="w-full" disabled={isPending || isCreatingProduct || isUpdatingProduct}>
          {(isPending || isCreatingProduct || isUpdatingProduct) ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Product" : "Update Product")}
        </Button>
      </form>
    </div>
  )
}