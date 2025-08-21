import type { ObjectId } from "mongodb"

export interface InventoryItem {
  _id?: ObjectId
  itemName: string
  brandName: string
  category: string
  quantity: number
  shadesCode?: string
  stockIn: number
  unitPrice: number
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}