import type { Bill } from "@/lib/models/Bill"

export function shareToWhatsApp(bill: Bill): void {
  if (!bill.customerMobile) {
    alert("No customer mobile number available for this bill")
    return
  }

  const clientName = bill.clientName || "Valued Customer"
  const message = `Hello ${clientName}! 🌸\n\nYour total bill was ₹${bill.totalAmount.toFixed(2)}\n\nThank you for visiting HUSN Beauty Salon! ✨\n\nWe hope you loved your experience with us. Looking forward to seeing you again soon! 💄`

  const whatsappUrl = `https://wa.me/${bill.customerMobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
