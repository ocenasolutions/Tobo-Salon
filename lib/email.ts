import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.")
    }

    const emailTransporter = getTransporter()

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@salon.com",
      to: email,
      subject: "Verify Your Email - Salon Management",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Thank you for signing up! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
    }

    console.log("[v0] Attempting to send email to:", email)
    console.log("[v0] SMTP Config:", {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER ? "***configured***" : "missing",
      from: process.env.SMTP_FROM || "noreply@salon.com",
    })

    const result = await emailTransporter.sendMail(mailOptions)
    console.log("[v0] Email sent successfully:", result.messageId)
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
