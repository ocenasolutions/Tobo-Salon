import type { ObjectId } from "mongodb"

export interface BillItem {
  packageId: ObjectId
  packageName: string
  packagePrice: number
  packageType: "Basic" | "Premium"
}

export interface Bill {
  _id?: ObjectId
  userId: ObjectId
  items: BillItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}
