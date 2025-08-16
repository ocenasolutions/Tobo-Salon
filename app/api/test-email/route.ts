export const runtime = "nodejs"

import nodemailer from "nodemailer"

export async function GET() {
  try {
    console.log("[v0] Testing SMTP configuration...")

    // Check environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
      hasPass: !!process.env.SMTP_PASS,
    }

    console.log("[v0] SMTP Config:", smtpConfig)

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return Response.json({
        success: false,
        error: "Missing SMTP environment variables",
        config: smtpConfig,
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT),
      secure: Number.parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    console.log("[v0] Testing SMTP connection...")

    // Test connection
    await transporter.verify()

    console.log("[v0] SMTP connection successful")

    return Response.json({
      success: true,
      message: "SMTP configuration is working",
      config: smtpConfig,
    })
  } catch (error: any) {
    console.error("[v0] SMTP test error:", error)

    return Response.json({
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
    })
  }
}
