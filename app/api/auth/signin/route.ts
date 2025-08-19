import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { comparePassword, generateToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Signin attempt started")

    const { email, password } = await request.json()
    console.log("[v0] Request parsed, email:", email)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Attempting database connection")
    const db = await getDatabase()
    console.log("[v0] Database connected successfully")

    const usersCollection = db.collection<User>("users")

    // Find user
    console.log("[v0] Looking for user with email:", email)
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] User found, checking verification status")
    // Check if user is verified
    if (!user.isVerified) {
      console.log("[v0] User not verified")
      return NextResponse.json({ error: "Please verify your email first" }, { status: 401 })
    }

    console.log("[v0] Verifying password")
    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Password valid, generating token")
    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
    })

    console.log("[v0] Token generated successfully")
    return NextResponse.json({ message: "Sign in successful", token }, { status: 200 })
  } catch (error) {
    console.error("[v0] Sign in error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      error: error,
    })
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    )
  }
}
