import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  isVerified: boolean
  otp?: string
  otpExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  userId: string
  email: string
}
