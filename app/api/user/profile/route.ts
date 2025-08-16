import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0, otp: 0, otpExpiry: 0 } }, // Exclude sensitive fields
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
