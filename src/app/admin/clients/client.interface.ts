import { AddressObject } from '@/lib/utils/address-utils';

export { AddressObject };

export interface ClientData {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone: number
  address: string | AddressObject
  status: boolean
  image?: string
  createdAt: string
  updatedAt: string
} 