import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import { verifyToken, comparePassword, hashPassword, generateOTP } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, otp } = await request.json()

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

    const user = await usersCollection.findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If no OTP provided, verify current password and send OTP
    if (!otp) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
      }

      const isValidPassword = await comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
      }

      // Generate and send OTP
      const generatedOTP = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            otp: generatedOTP,
            otpExpiry,
            updatedAt: new Date(),
          },
        },
      )

      try {
        await sendOTPEmail(user.email, generatedOTP)
        return NextResponse.json({ message: "OTP sent to your email", requiresOTP: true }, { status: 200 })
      } catch (emailError) {
        return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
      }
    }

    // If OTP provided, verify and change password
    if (!user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword)

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
        $unset: {
          otp: "",
          otpExpiry: "",
        },
      },
    )

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
