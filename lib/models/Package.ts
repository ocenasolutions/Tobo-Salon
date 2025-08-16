import type { ObjectId } from "mongodb"

export interface Package {
  _id?: ObjectId
  name: string
  description: string
  price: number
  type: "Basic" | "Premium"
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
