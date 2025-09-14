"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Image as ImageIcon, 
  Send,
  Filter,
  SortAsc,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react"
import { getProductReviews, createProductReview } from "@/actions/products"
import { toast } from "sonner"
import { ProductReview } from "@/actions/products"

interface ProductReviewsProps {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({ productId, productName, averageRating, totalReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = React.useState<ProductReview[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showReviewForm, setShowReviewForm] = React.useState(false)
  const [filters, setFilters] = React.useState({
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [reviewForm, setReviewForm] = React.useState({
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  })

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const result = await getProductReviews(productId, {
        rating: filters.rating ? parseInt(filters.rating) : undefined,
        sortBy: filters.sortBy as 'createdAt' | 'rating' | 'helpful',
        sortOrder: filters.sortOrder
      })
      setReviews(result.reviews)
    } catch (error) {
      console.error("Error loading reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadReviews()
  }, [productId, filters])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (reviewForm.rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createProductReview({
        productId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        images: reviewForm.images
      })

      if (result.success) {
        toast.success("Review submitted successfully")
        setReviewForm({ rating: 0, title: '', comment: '', images: [] })
        setShowReviewForm(false)
        loadReviews() // Reload reviews
      } else {
        toast.error(result.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }))
  }

  const renderStars = (rating: number, interactive = false, onRatingClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingClick?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++
      }
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
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
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              {totalReviews} reviews • {averageRating.toFixed(1)} average rating
            </CardDescription>
          </div>
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review for {productName}</DialogTitle>
                <DialogDescription>
                  Share your experience with this product
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label>Rating *</Label>
                  <div className="mt-2">
                    {renderStars(reviewForm.rating, true, handleRatingClick)}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="title">Review Title *</Label>
                  <Input
                    id="title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="comment">Your Review *</Label>
                  <Textarea
                    id="comment"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Tell us about your experience with this product"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Based on {totalReviews} reviews
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="helpful">Helpful</SelectItem>
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

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.timeAgo}
                          </span>
                          {review.verified && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">{review.title}</h4>
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Was this helpful?</span>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {review.helpful}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {review.notHelpful}
                      </Button>
                    </div>
                  </div>
                  
                  {review.adminResponse && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Store Response</p>
                      <p className="text-sm text-muted-foreground">{review.adminResponse.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
