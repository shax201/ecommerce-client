"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, X, Ruler, ArrowLeft, Save, CheckSquare, Square } from "lucide-react"
import { toast } from "sonner"
import { useCreateSizeMutation } from "@/lib/features/attributes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export function AddSizeForm() {
  const router = useRouter()
  const [isMultipleMode, setIsMultipleMode] = useState(false)
  const [singleSize, setSingleSize] = useState("")
  const [multipleSizes, setMultipleSizes] = useState<string[]>([""])
  const [isSelectAllModalOpen, setIsSelectAllModalOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<{
    clothing: boolean
    waist: boolean
    shoes: boolean
    all: boolean
  }>({
    clothing: false,
    waist: false,
    shoes: false,
    all: false
  })

  // Redux hooks
  const [createSize, { isLoading: isSubmitting }] = useCreateSizeMutation()

  // Size data
  const sizeData = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
    waist: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'],
    shoes: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
  }

  // Handle single size input
  const handleSingleSizeChange = (value: string) => {
    setSingleSize(value)
  }

  // Handle multiple sizes input
  const handleMultipleSizeChange = (index: number, value: string) => {
    const newSizes = [...multipleSizes]
    newSizes[index] = value
    setMultipleSizes(newSizes)
  }

  // Add new size field
  const addSizeField = () => {
    setMultipleSizes([...multipleSizes, ""])
  }

  // Remove size field
  const removeSizeField = (index: number) => {
    if (multipleSizes.length > 1) {
      const newSizes = multipleSizes.filter((_, i) => i !== index)
      setMultipleSizes(newSizes)
    }
  }

  // Handle category selection change
  const handleCategoryChange = (category: keyof typeof selectedCategories) => {
    if (category === 'all') {
      const newValue = !selectedCategories.all
      setSelectedCategories({
        clothing: newValue,
        waist: newValue,
        shoes: newValue,
        all: newValue
      })
    } else {
      const newCategories = {
        ...selectedCategories,
        [category]: !selectedCategories[category]
      }
      
      // Update "all" based on whether all categories are selected
      const allSelected = newCategories.clothing && newCategories.waist && newCategories.shoes
      newCategories.all = allSelected
      
      setSelectedCategories(newCategories)
    }
  }

  // Apply selected sizes
  const applySelectedSizes = () => {
    const selectedSizes: string[] = []
    
    if (selectedCategories.clothing) {
      selectedSizes.push(...sizeData.clothing)
    }
    if (selectedCategories.waist) {
      selectedSizes.push(...sizeData.waist)
    }
    if (selectedCategories.shoes) {
      selectedSizes.push(...sizeData.shoes)
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one category")
      return
    }

    // Automatically switch to multiple mode when selecting multiple sizes
    if (!isMultipleMode) {
      setIsMultipleMode(true)
      toast.info("Switched to multiple sizes mode for bulk selection")
    }

    // Remove empty fields and add selected sizes
    const nonEmptySizes = multipleSizes.filter(size => size.trim() !== "")
    setMultipleSizes([...nonEmptySizes, ...selectedSizes])

    setIsSelectAllModalOpen(false)
    setSelectedCategories({
      clothing: false,
      waist: false,
      shoes: false,
      all: false
    })
    
    toast.success(`Added ${selectedSizes.length} size(s)`)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMultipleMode) {
      const validSizes = multipleSizes.filter(size => size.trim() !== "")
      if (validSizes.length === 0) {
        toast.error("Please add at least one size")
        return
      }
      
      // Check for duplicates
      const uniqueSizes = new Set(validSizes.map(size => size.toUpperCase()))
      if (uniqueSizes.size !== validSizes.length) {
        toast.error("Duplicate sizes are not allowed")
        return
      }
      
      await submitSizes({ sizes: validSizes })
    } else {
      if (!singleSize.trim()) {
        toast.error("Please enter a size")
        return
      }
      
      await submitSizes({ size: singleSize.trim() })
    }
  }

  // Submit sizes to server
  const submitSizes = async (payload: { size?: string; sizes?: string[] }) => {
    try {
      const loadingToast = toast.loading("Creating size(s)...")
      
      const result = await createSize(payload).unwrap()
      
      toast.dismiss(loadingToast)
      
      toast.success("Size(s) created successfully!", {
        description: result.message
      })
      
      // Reset form
      if (isMultipleMode) {
        setMultipleSizes([""])
      } else {
        setSingleSize("")
      }
      
      // Redirect back to sizes list
      setTimeout(() => {
        router.push("/admin/attributes/sizes")
      }, 1500)
    } catch (error: any) {
      console.error("Error creating sizes:", error)
      toast.error("Failed to create size(s)", {
        description: error?.data?.message || "An unexpected error occurred"
      })
    }
  }

  // Get size category and description
  const getSizeInfo = (size: string) => {
    const sizeMap: Record<string, { category: string; description: string }> = {
      'XS': { category: 'Extra Small', description: 'Extra Small size' },
      'S': { category: 'Small', description: 'Small size' },
      'M': { category: 'Medium', description: 'Medium size' },
      'L': { category: 'Large', description: 'Large size' },
      'XL': { category: 'Extra Large', description: 'Extra Large size' },
      'XXL': { category: '2X Large', description: '2X Large size' },
      '2XL': { category: '2X Large', description: '2X Large size' },
      '3XL': { category: '3X Large', description: '3X Large size' },
      '4XL': { category: '4X Large', description: '4X Large size' },
      '5XL': { category: '5X Large', description: '5X Large size' },
      '28': { category: 'Waist Size', description: '28 inch waist' },
      '30': { category: 'Waist Size', description: '30 inch waist' },
      '32': { category: 'Waist Size', description: '32 inch waist' },
      '34': { category: 'Waist Size', description: '34 inch waist' },
      '36': { category: 'Waist Size', description: '36 inch waist' },
      '38': { category: 'Waist Size', description: '38 inch waist' },
      '40': { category: 'Waist Size', description: '40 inch waist' },
      '42': { category: 'Waist Size', description: '42 inch waist' },
      '44': { category: 'Waist Size', description: '44 inch waist' },
      '46': { category: 'Waist Size', description: '46 inch waist' },
      '48': { category: 'Waist Size', description: '48 inch waist' },
      '50': { category: 'Waist Size', description: '50 inch waist' },
      '6': { category: 'Shoe Size', description: 'US Size 6' },
      '7': { category: 'Shoe Size', description: 'US Size 7' },
      '8': { category: 'Shoe Size', description: 'US Size 8' },
      '9': { category: 'Shoe Size', description: 'US Size 9' },
      '10': { category: 'Shoe Size', description: 'US Size 10' },
      '11': { category: 'Shoe Size', description: 'US Size 11' },
      '12': { category: 'Shoe Size', description: 'US Size 12' },
      '13': { category: 'Shoe Size', description: 'US Size 13' },
      '14': { category: 'Shoe Size', description: 'US Size 14' },
      '15': { category: 'Shoe Size', description: 'US Size 15' }
    }
    
    const normalizedSize = size.toUpperCase().trim()
    return sizeMap[normalizedSize] || { category: 'Custom', description: 'Custom size' }
  }

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sizes
      </Button>

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Add Sizes
          </CardTitle>
          <CardDescription>
            Choose whether to add a single size or multiple sizes at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="multiple-mode"
              checked={isMultipleMode}
              onCheckedChange={setIsMultipleMode}
            />
            <Label htmlFor="multiple-mode">
              {isMultipleMode ? "Multiple Sizes Mode" : "Single Size Mode"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isMultipleMode ? "Add Multiple Sizes" : "Add Single Size"}
            </CardTitle>
            <CardDescription>
              {isMultipleMode 
                ? "Add multiple sizes at once. Each size will be created as a separate attribute."
                : "Add a single size attribute to your product catalog."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isMultipleMode ? (
              /* Single Size Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="single-size">Size</Label>
                  <div className="flex gap-3">
                    <Input
                      id="single-size"
                      placeholder="e.g., S, M, L, XL, 32, 10..."
                      value={singleSize}
                      onChange={(e) => handleSingleSizeChange(e.target.value)}
                      className="flex-1"
                    />
                    {singleSize && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                          {singleSize.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {singleSize && (
                    <div className="text-sm text-muted-foreground">
                      {getSizeInfo(singleSize).description}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Multiple Sizes Mode */
              <div className="space-y-4">
                <div className="space-y-3">
                  {multipleSizes.map((size, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder={`Size ${index + 1} (e.g., S, M, L, XL, 32, 10...)`}
                          value={size}
                          onChange={(e) => handleMultipleSizeChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {size && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                              {size.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                        {multipleSizes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSizeField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {size && (
                        <div className="text-sm text-muted-foreground ml-1">
                          {getSizeInfo(size).description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSizeField}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Size
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {((!isMultipleMode && singleSize) || (isMultipleMode && multipleSizes.some(s => s.trim()))) && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                These are the sizes that will be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!isMultipleMode ? (
                  singleSize && (
                    <div className="flex items-center gap-2 p-2 border rounded-lg">
                      <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                        {singleSize.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getSizeInfo(singleSize).category}
                      </span>
                    </div>
                  )
                ) : (
                  multipleSizes
                    .filter(size => size.trim() !== "")
                    .map((size, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                          {size.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getSizeInfo(size).category}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Size Suggestions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Common Size Suggestions</CardTitle>
                <CardDescription>
                  Click on any size below to quickly add it
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSelectAllModalOpen(true)}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Select All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Clothing Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeData.clothing.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleSizes([...multipleSizes, size])
                        } else {
                          setSingleSize(size)
                        }
                      }}
                      className="text-sm"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Waist Sizes (inches)</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeData.waist.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleSizes([...multipleSizes, size])
                        } else {
                          setSingleSize(size)
                        }
                      }}
                      className="text-sm"
                    >
                      {size}"
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Shoe Sizes (US)</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeData.shoes.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleSizes([...multipleSizes, size])
                        } else {
                          setSingleSize(size)
                        }
                      }}
                      className="text-sm"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Size{isMultipleMode ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Select All Modal */}
      <Dialog open={isSelectAllModalOpen} onOpenChange={setIsSelectAllModalOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-md  sm:mx-auto sm:my-auto rounded-xl border-0 shadow-2xl bg-background/95 backdrop-blur-sm">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
              Select All Sizes
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Choose which size categories you want to add all at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id="select-all"
                    checked={selectedCategories.all}
                    onCheckedChange={() => handleCategoryChange('all')}
                    className="mt-0.5"
                  />
                  <Label htmlFor="select-all" className="font-semibold text-sm cursor-pointer flex-1">
                    Select All Categories
                  </Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {sizeData.clothing.length + sizeData.waist.length + sizeData.shoes.length}
                  </span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="clothing"
                      checked={selectedCategories.clothing}
                      onCheckedChange={() => handleCategoryChange('clothing')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="clothing" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Clothing Sizes</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sizeData.clothing.length}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="waist"
                      checked={selectedCategories.waist}
                      onCheckedChange={() => handleCategoryChange('waist')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="waist" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Waist Sizes</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sizeData.waist.length}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="shoes"
                      checked={selectedCategories.shoes}
                      onCheckedChange={() => handleCategoryChange('shoes')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="shoes" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Shoe Sizes</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {sizeData.shoes.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-4 pb-4 pt-3 border-t bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSelectAllModalOpen(false)}
                className="flex-1 sm:flex-none sm:px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={applySelectedSizes}
                className="flex-1 sm:flex-none sm:px-4 h-9"
              >
                Apply Selection
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 