export interface InventoryItem {
  _id?: string
  name: string 
  brandName: string 
  category: string 
  quantity: number 
  shadesCode?: string 
  stockIn: number 
  pricePerUnit: number 
  expiryDate?: Date
  total: number
  paymentStatus: "Paid" | "Unpaid"
  dateEntered: Date
  userId: string
  createdAt?: Date
  updatedAt?: Date
}
