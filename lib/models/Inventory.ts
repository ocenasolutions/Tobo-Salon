export interface InventoryItem {
  _id?: string
  name: string
  expiryDate?: Date
  quantity: number
  pricePerUnit: number
  total: number
  paymentStatus: "Paid" | "Unpaid"
  dateEntered: Date
  userId: string
  createdAt?: Date
  updatedAt?: Date
}
