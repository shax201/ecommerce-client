"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Ruler } from "lucide-react"
import { toast } from "sonner"
import { useUpdateSizeMutation, SizeData } from "@/lib/features/attributes"

interface EditSizeFormProps {
  size: SizeData;
}

export function EditSizeForm({ size }: EditSizeFormProps) {
  const router = useRouter()
  const [sizeValue, setSizeValue] = useState(size.size)
  
  // Redux hooks
  const [updateSize, { isLoading: isSubmitting }] = useUpdateSizeMutation()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sizeValue.trim()) {
      toast.error("Please enter a size")
      return
    }

    if (sizeValue.trim() === size.size) {
      toast.info("No changes made")
      return
    }

    try {
      const loadingToast = toast.loading("Updating size...")
      
      const result = await updateSize({ 
        id: size._id, 
        payload: { size: sizeValue.trim() } 
      }).unwrap()
      
      toast.dismiss(loadingToast)
      
      toast.success("Size updated successfully!", {
        description: result.message
      })
      
      // Redirect back to sizes list
      setTimeout(() => {
        router.push("/admin/attributes/sizes")
      }, 1500)
    } catch (error: any) {
      console.error("Error updating size:", error)
      toast.error("Failed to update size", {
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Edit Size
            </CardTitle>
            <CardDescription>
              Update the size attribute information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <div className="flex gap-3">
                <Input
                  id="size"
                  placeholder="e.g., S, M, L, XL, 32, 10..."
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                  className="flex-1"
                />
                {sizeValue && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                      {sizeValue.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
              {sizeValue && (
                <div className="text-sm text-muted-foreground">
                  {getSizeInfo(sizeValue).description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {sizeValue && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how the updated size will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                    {sizeValue.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getSizeInfo(sizeValue).category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            disabled={isSubmitting || !sizeValue.trim() || sizeValue.trim() === size.size}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Size
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
