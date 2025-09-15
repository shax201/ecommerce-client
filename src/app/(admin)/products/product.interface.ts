export interface ProductData {
  _id: string
  title: string
  description: string
  primaryImage: string
  optionalImages: string[]
  regularPrice: number
  discountPrice: number
  videoLink?: string
  catagory: string[] // Note: API has typo "catagory" instead of "category"
  color: string[] // Array of color IDs
  size: string[] // Array of size IDs
  createdAt: string
  updatedAt: string
  __v: number
  variants?: {
    color: string[]
    size: string[]
  }
}

export interface ProductWithCategory extends ProductData {
  categoryNames?: string[]
} 