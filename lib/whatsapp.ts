interface WhatsAppMessage {
  to: string
  message: string
}

export class WhatsAppService {
  private static readonly ADMIN_NUMBER = "+918077057743"

  static async sendAdminBillNotification(billAmount: number, clientName: string): Promise<void> {
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const message =
      `🧾 *HUSN Beauty - Bill Processed*\n\n` +
      `📅 Time: ${currentTime}\n` +
      `👤 Client: ${clientName}\n` +
      `💰 Amount: ₹${billAmount.toFixed(2)}\n\n` +
      `✅ Bill has been successfully processed.`

    try {
      await this.sendWhatsAppMessage(this.ADMIN_NUMBER, message)
    } catch (error) {
      console.error("Admin WhatsApp notification failed:", error)
      // Don't throw error to avoid breaking bill creation
    }
  }

  static async sendBillNotification(billAmount: number, clientName: string, customerMobile?: string): Promise<void> {
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const message =
      `🧾 *HUSN Beauty - Bill Processed*\n\n` +
      `📅 Time: ${currentTime}\n` +
      `👤 Client: ${clientName}\n` +
      `💰 Amount: ₹${billAmount.toFixed(2)}\n\n` +
      `✅ Bill has been successfully processed.`

    try {
      // Send to admin (always)
      await this.sendWhatsAppMessage(this.ADMIN_NUMBER, message)

      // Send to customer if mobile number provided
      if (customerMobile && customerMobile.trim()) {
        const customerMessage =
          `💄 *HUSN Beauty Salon*\n\n` +
          `Dear ${clientName},\n\n` +
          `Your total bill was ₹${billAmount.toFixed(2)}\n\n` +
          `Thank you for visiting HUSN Beauty Salon! ✨\n` +
          `We hope you loved your experience with us. 💅\n\n` +
          `Visit us again soon! 🌸`

        await this.sendWhatsAppMessage(customerMobile, customerMessage)
      }
    } catch (error) {
      console.error("WhatsApp notification failed:", error)
      // Don't throw error to avoid breaking bill creation
    }
  }

  private static async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    // Using Twilio WhatsApp API - you can replace with your preferred WhatsApp service
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER // e.g., "whatsapp:+14155238886"

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("WhatsApp credentials not configured")
      return
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const formData = new URLSearchParams()
    formData.append("From", fromNumber)
    formData.append("To", `whatsapp:${to}`)
    formData.append("Body", message)

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WhatsApp API error: ${error}`)
    }
  }
}
