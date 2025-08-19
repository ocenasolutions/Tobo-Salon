export interface InventoryItem {
  _id?: string
  name: string // Item Name - mandatory field
  brandName: string // Brand Name - mandatory field
  category: string // Category - mandatory field
  quantity: number // Current stock quantity - mandatory field
  shadesCode?: string // Shades Code - optional field
  stockIn: number // Stock In - mandatory field for tracking initial/restocked quantity
  pricePerUnit: number // Unit Price - mandatory field
  expiryDate?: Date
  total: number
  paymentStatus: "Paid" | "Unpaid"
  dateEntered: Date
  userId: string
  createdAt?: Date
  updatedAt?: Date
}
