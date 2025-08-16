import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { UserSession } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-build"

export function generateToken(payload: UserSession): string {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production")
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): UserSession | null {
  try {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
      return null
    }
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
