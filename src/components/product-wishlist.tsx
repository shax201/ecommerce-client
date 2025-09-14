"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Edit, 
  Star,
  Package,
  AlertCircle,
  CheckCircle,
  Plus,
  Filter,
  SortAsc
} from "lucide-react"
import { getWishlist, addToWishlist, removeFromWishlist, type ProductWishlist } from "@/actions/products"
import { toast } from "sonner"

interface ProductWishlistProps {
  productId?: string;
  productName?: string;
  showAddButton?: boolean;
}

export function ProductWishlist({ productId, productName, showAddButton = true }: ProductWishlistProps) {
  const [wishlist, setWishlist] = React.useState<ProductWishlist[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAdding, setIsAdding] = React.useState(false)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [filters, setFilters] = React.useState({
    priority: '',
    sortBy: 'addedAt' as 'addedAt' | 'priority' | 'productTitle',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [addForm, setAddForm] = React.useState({
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const loadWishlist = async () => {
    setIsLoading(true)
    try {
      const result = await getWishlist({
        priority: filters.priority as 'low' | 'medium' | 'high' | undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      setWishlist(result.items)
    } catch (error) {
      console.error("Error loading wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadWishlist()
  }, [filters])

  const handleAddToWishlist = async () => {
    if (!productId) return

    setIsAdding(true)
    try {
      const result = await addToWishlist(productId, addForm.notes, addForm.priority)
      
      if (result.success) {
        toast.success("Product added to wishlist")
        setAddForm({ notes: '', priority: 'medium' })
        setShowAddDialog(false)
        loadWishlist() // Reload wishlist
      } else {
        toast.error(result.message || "Failed to add to wishlist")
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast.error("Failed to add to wishlist")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const result = await removeFromWishlist(productId)
      
      if (result.success) {
        toast.success("Product removed from wishlist")
        loadWishlist() // Reload wishlist
      } else {
        toast.error(result.message || "Failed to remove from wishlist")
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from wishlist")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStockStatus = (product: any) => {
    if (!product.inventory?.trackInventory) return 'unlimited'
    if (product.inventory.availableStock === 0) return 'out_of_stock'
    if (product.inventory.availableStock <= product.inventory.lowStockThreshold) return 'low_stock'
    return 'in_stock'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600'
      case 'low_stock':
        return 'text-orange-600'
      case 'out_of_stock':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>
              {wishlist.length} items saved for later
            </CardDescription>
          </div>
          {showAddButton && productId && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Wishlist</DialogTitle>
                  <DialogDescription>
                    Add {productName} to your wishlist
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={addForm.priority} 
                      onValueChange={(value) => setAddForm(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={addForm.notes}
                      onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add a note about this item..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddToWishlist} disabled={isAdding}>
                      {isAdding ? "Adding..." : "Add to Wishlist"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as 'addedAt' | 'priority' | 'productTitle' }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addedAt">Date Added</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="productTitle">Product Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
            >
              <SortAsc className={`h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Wishlist Items */}
          {wishlist.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add products you love to save them for later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => {
                const stockStatus = getStockStatus(item.product)
                const stockStatusColor = getStockStatusColor(stockStatus)
                
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium truncate">{item.product.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.product.shortDescription || item.product.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromWishlist(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold">${item.product.discountPrice}</span>
                            {item.product.regularPrice > item.product.discountPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.product.regularPrice}
                              </span>
                            )}
                          </div>
                          
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority} priority
                          </Badge>
                          
                          <span className={`text-sm ${stockStatusColor}`}>
                            {stockStatus === 'unlimited' ? 'In Stock' : 
                             stockStatus === 'low_stock' ? 'Low Stock' :
                             stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                          </span>
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{item.notes}"
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Added {item.timeAgo}</span>
                            {item.product.analytics?.averageRating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{item.product.analytics.averageRating.toFixed(1)}</span>
                                <span>({item.product.analytics.totalReviews})</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" disabled={stockStatus === 'out_of_stock'}>
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
