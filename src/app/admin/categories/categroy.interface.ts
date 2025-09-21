export interface CategoryData {
    _id: string
    title: string
    description: string
    parent: string | null
    createdAt: string
    updatedAt: string
    __v: number
    productCount?: number
  }

export interface CategoryWithSubCategories extends CategoryData {
    subCategories: CategoryData[]
  }