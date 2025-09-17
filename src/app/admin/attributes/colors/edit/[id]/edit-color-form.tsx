"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Palette } from "lucide-react"
import { toast } from "sonner"
import { useUpdateColorMutation, ColorData } from "@/lib/features/attributes"

interface EditColorFormProps {
  color: ColorData;
}

export function EditColorForm({ color }: EditColorFormProps) {
  const router = useRouter()
  const [colorValue, setColorValue] = useState(color.color)
  
  // Redux hooks
  const [updateColor, { isLoading: isSubmitting }] = useUpdateColorMutation()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!colorValue.trim()) {
      toast.error("Please enter a color")
      return
    }

    if (colorValue.trim() === color.color) {
      toast.info("No changes made")
      return
    }

    try {
      const loadingToast = toast.loading("Updating color...")
      
      const result = await updateColor({ 
        id: color._id, 
        payload: { color: colorValue.trim() } 
      }).unwrap()
      
      toast.dismiss(loadingToast)
      
      toast.success("Color updated successfully!", {
        description: result.message
      })
      
      // Redirect back to colors list
      setTimeout(() => {
        router.push("/admin/attributes/colors")
      }, 1500)
    } catch (error: any) {
      console.error("Error updating color:", error)
      toast.error("Failed to update color", {
        description: error?.data?.message || "An unexpected error occurred"
      })
    }
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

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Colors
      </Button>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Edit Color
            </CardTitle>
            <CardDescription>
              Update the color attribute information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color Name</Label>
              <div className="flex gap-3">
                <Input
                  id="color"
                  placeholder="e.g., Red, Blue, Green..."
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="flex-1"
                />
                {colorValue && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: getColorStyle(colorValue) }}
                    />
                    <Badge variant="outline">{colorValue}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {colorValue && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how the updated color will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: getColorStyle(colorValue) }}
                  />
                  <span className="font-medium">{colorValue}</span>
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
            disabled={isSubmitting || !colorValue.trim() || colorValue.trim() === color.color}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Color
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
