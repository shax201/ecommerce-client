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
import { Plus, X, Palette, ArrowLeft, Save, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { useCreateColorMutation } from "@/lib/features/attributes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export function AddColorForm() {
  const router = useRouter()
  const [isMultipleMode, setIsMultipleMode] = useState(false)
  const [singleColor, setSingleColor] = useState("")
  const [multipleColors, setMultipleColors] = useState<string[]>([""])
  const [isSelectAllModalOpen, setIsSelectAllModalOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<{
    primary: boolean
    secondary: boolean
    neutral: boolean
    all: boolean
  }>({
    primary: false,
    secondary: false,
    neutral: false,
    all: false
  })

  // Redux hooks
  const [createColor, { isLoading: isSubmitting }] = useCreateColorMutation()

  // Color data
  const colorData = {
    primary: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'],
    secondary: ['Pink', 'Teal', 'Lime', 'Indigo', 'Cyan', 'Amber'],
    neutral: ['Black', 'White', 'Gray', 'Brown', 'Navy', 'Maroon', 'Olive', 'Silver', 'Gold']
  }

  // Handle single color input
  const handleSingleColorChange = (value: string) => {
    setSingleColor(value)
  }

  // Handle multiple colors input
  const handleMultipleColorChange = (index: number, value: string) => {
    const newColors = [...multipleColors]
    newColors[index] = value
    setMultipleColors(newColors)
  }

  // Add new color field
  const addColorField = () => {
    setMultipleColors([...multipleColors, ""])
  }

  // Remove color field
  const removeColorField = (index: number) => {
    if (multipleColors.length > 1) {
      const newColors = multipleColors.filter((_, i) => i !== index)
      setMultipleColors(newColors)
    }
  }

  // Handle category selection change
  const handleCategoryChange = (category: keyof typeof selectedCategories) => {
    if (category === 'all') {
      const newValue = !selectedCategories.all
      setSelectedCategories({
        primary: newValue,
        secondary: newValue,
        neutral: newValue,
        all: newValue
      })
    } else {
      const newCategories = {
        ...selectedCategories,
        [category]: !selectedCategories[category]
      }
      
      // Update "all" based on whether all categories are selected
      const allSelected = newCategories.primary && newCategories.secondary && newCategories.neutral
      newCategories.all = allSelected
      
      setSelectedCategories(newCategories)
    }
  }

  // Apply selected colors
  const applySelectedColors = () => {
    const selectedColors: string[] = []
    
    if (selectedCategories.primary) {
      selectedColors.push(...colorData.primary)
    }
    if (selectedCategories.secondary) {
      selectedColors.push(...colorData.secondary)
    }
    if (selectedCategories.neutral) {
      selectedColors.push(...colorData.neutral)
    }

    if (selectedColors.length === 0) {
      toast.error("Please select at least one category")
      return
    }

    // Automatically switch to multiple mode when selecting multiple colors
    if (!isMultipleMode) {
      setIsMultipleMode(true)
      toast.info("Switched to multiple colors mode for bulk selection")
    }

    // Remove empty fields and add selected colors
    const nonEmptyColors = multipleColors.filter(color => color.trim() !== "")
    setMultipleColors([...nonEmptyColors, ...selectedColors])

    setIsSelectAllModalOpen(false)
    setSelectedCategories({
      primary: false,
      secondary: false,
      neutral: false,
      all: false
    })
    
    toast.success(`Added ${selectedColors.length} color(s)`)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMultipleMode) {
      const validColors = multipleColors.filter(color => color.trim() !== "")
      if (validColors.length === 0) {
        toast.error("Please add at least one color")
        return
      }
      
      // Check for duplicates
      const uniqueColors = new Set(validColors.map(color => color.toLowerCase()))
      if (uniqueColors.size !== validColors.length) {
        toast.error("Duplicate colors are not allowed")
        return
      }
      
      await submitColors({ colors: validColors })
    } else {
      if (!singleColor.trim()) {
        toast.error("Please enter a color")
        return
      }
      
      await submitColors({ color: singleColor.trim() })
    }
  }

  // Submit colors to server
  const submitColors = async (payload: { color?: string; colors?: string[] }) => {
    try {
      const loadingToast = toast.loading("Creating color(s)...")
      
      const result = await createColor(payload).unwrap()
      
      toast.dismiss(loadingToast)
      
      toast.success("Color(s) created successfully!", {
        description: result.message
      })
      
      // Reset form
      if (isMultipleMode) {
        setMultipleColors([""])
      } else {
        setSingleColor("")
      }
      
      // Redirect back to colors list
      setTimeout(() => {
        router.push("/admin/attributes/colors")
      }, 1500)
    } catch (error: any) {
      console.error("Error creating colors:", error)
      toast.error("Failed to create color(s)", {
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

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Add Colors
          </CardTitle>
          <CardDescription>
            Choose whether to add a single color or multiple colors at once
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
              {isMultipleMode ? "Multiple Colors Mode" : "Single Color Mode"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isMultipleMode ? "Add Multiple Colors" : "Add Single Color"}
            </CardTitle>
            <CardDescription>
              {isMultipleMode 
                ? "Add multiple colors at once. Each color will be created as a separate attribute."
                : "Add a single color attribute to your product catalog."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isMultipleMode ? (
              /* Single Color Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="single-color">Color Name</Label>
                  <div className="flex gap-3">
                    <Input
                      id="single-color"
                      placeholder="e.g., Red, Blue, Green..."
                      value={singleColor}
                      onChange={(e) => handleSingleColorChange(e.target.value)}
                      className="flex-1"
                    />
                    {singleColor && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: getColorStyle(singleColor) }}
                        />
                        <Badge variant="outline">{singleColor}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Multiple Colors Mode */
              <div className="space-y-4">
                <div className="space-y-3">
                  {multipleColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder={`Color ${index + 1} (e.g., Red, Blue, Green...)`}
                        value={color}
                        onChange={(e) => handleMultipleColorChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {color && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: getColorStyle(color) }}
                          />
                          <Badge variant="outline">{color}</Badge>
                        </div>
                      )}
                      {multipleColors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColorField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addColorField}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Color
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {((!isMultipleMode && singleColor) || (isMultipleMode && multipleColors.some(c => c.trim()))) && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                These are the colors that will be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!isMultipleMode ? (
                  singleColor && (
                    <div className="flex items-center gap-2 p-2 border rounded-lg">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: getColorStyle(singleColor) }}
                      />
                      <span className="font-medium">{singleColor}</span>
                    </div>
                  )
                ) : (
                  multipleColors
                    .filter(color => color.trim() !== "")
                    .map((color, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: getColorStyle(color) }}
                        />
                        <span className="font-medium">{color}</span>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Color Suggestions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Common Color Suggestions</CardTitle>
                <CardDescription>
                  Click on any color below to quickly add it
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
                <h4 className="font-medium mb-2">Primary Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {colorData.primary.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleColors([...multipleColors, color])
                        } else {
                          setSingleColor(color)
                        }
                      }}
                      className="text-sm flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: getColorStyle(color) }}
                      />
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Secondary Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {colorData.secondary.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleColors([...multipleColors, color])
                        } else {
                          setSingleColor(color)
                        }
                      }}
                      className="text-sm flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: getColorStyle(color) }}
                      />
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Neutral Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {colorData.neutral.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isMultipleMode) {
                          setMultipleColors([...multipleColors, color])
                        } else {
                          setSingleColor(color)
                        }
                      }}
                      className="text-sm flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: getColorStyle(color) }}
                      />
                      {color}
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
                Create Color{isMultipleMode ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Select All Modal */}
      <Dialog open={isSelectAllModalOpen} onOpenChange={setIsSelectAllModalOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-md mx-4 my-4 sm:mx-auto sm:my-auto rounded-xl border-0 shadow-2xl bg-background/95 backdrop-blur-sm">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
              Select All Colors
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Choose which color categories you want to add all at once
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
                    {colorData.primary.length + colorData.secondary.length + colorData.neutral.length}
                  </span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="primary"
                      checked={selectedCategories.primary}
                      onCheckedChange={() => handleCategoryChange('primary')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="primary" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Primary Colors</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {colorData.primary.length}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="secondary"
                      checked={selectedCategories.secondary}
                      onCheckedChange={() => handleCategoryChange('secondary')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="secondary" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Secondary Colors</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {colorData.secondary.length}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="neutral"
                      checked={selectedCategories.neutral}
                      onCheckedChange={() => handleCategoryChange('neutral')}
                      className="mt-0.5"
                    />
                    <Label htmlFor="neutral" className="cursor-pointer flex-1">
                      <span className="font-medium text-sm">Neutral Colors</span>
                    </Label>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {colorData.neutral.length}
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
                onClick={applySelectedColors}
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