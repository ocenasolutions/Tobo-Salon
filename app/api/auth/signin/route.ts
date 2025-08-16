import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { comparePassword, generateToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
    })

    return NextResponse.json({ message: "Sign in successful", token }, { status: 200 })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
