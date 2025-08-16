import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { generateToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user with matching email and OTP
    const user = await usersCollection.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Update user as verified and remove OTP
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          otp: "",
          otpExpiry: "",
        },
      },
    )

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
    })

    return NextResponse.json({ message: "Email verified successfully", token }, { status: 200 })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
