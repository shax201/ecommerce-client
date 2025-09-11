export type OrderStatus = 'processing' | 'delivered' | 'cancelled'

export interface OrderData {
  _id: string
  productID: string[]
  clientID: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: boolean
  shipping: string
  createdAt: string
  updatedAt: string
  __v: number
} 