import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { hashPassword, generateOTP } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] SMTP Environment Variables Check:")
    console.log("[v0] SMTP_HOST:", process.env.SMTP_HOST ? "SET" : "NOT SET")
    console.log("[v0] SMTP_PORT:", process.env.SMTP_PORT ? "SET" : "NOT SET")
    console.log("[v0] SMTP_USER:", process.env.SMTP_USER ? "SET" : "NOT SET")
    console.log("[v0] SMTP_PASS:", process.env.SMTP_PASS ? "SET" : "NOT SET")
    console.log("[v0] SMTP_FROM:", process.env.SMTP_FROM ? "SET" : "NOT SET")

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and generate OTP
    const hashedPassword = await hashPassword(password)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    try {
      console.log("[v0] Attempting to send OTP email to:", email)
      console.log("[v0] Generated OTP:", otp)
      await sendOTPEmail(email, otp)
      console.log("[v0] OTP email sent successfully")
    } catch (emailError) {
      console.error("[v0] Failed to send OTP email - Full error:", emailError)
      console.error("[v0] Error message:", emailError instanceof Error ? emailError.message : "Unknown error")
      console.error("[v0] Error stack:", emailError instanceof Error ? emailError.stack : "No stack trace")
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
    }

    const newUser: User = {
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(newUser)

    return NextResponse.json(
      { message: "User created successfully. Please check your email for OTP." },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
