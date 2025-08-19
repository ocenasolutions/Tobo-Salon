import type { ObjectId } from "mongodb"

export interface BillItem {
  packageId: ObjectId
  packageName: string
  packagePrice: number
  packageType: "Basic" | "Premium"
}

export interface ProductSale {
  inventoryId: ObjectId
  productName: string
  brandName: string
  quantitySold: number
  pricePerUnit: number
  totalPrice: number
}

export interface Expenditure {
  name: string
  price: number
  description?: string
}

export interface Bill {
  _id?: ObjectId
  userId: ObjectId
  items: BillItem[]
  totalAmount: number
  clientName: string
  customerMobile?: string
  upiAmount: number
  cardAmount: number
  cashAmount: number
  attendantBy: string
  productSale: number
  productSales?: ProductSale[]
  expenditures?: Expenditure[]
  createdAt: Date
  updatedAt: Date
}
