import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Bill, BillItem } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    const {
      packageIds,
      clientName,
      customerMobile,
      attendantBy,
      productSales = [],
      expenditures = [],
      upiAmount,
      cardAmount,
      cashAmount,
      paymentMethod,
    } = await request.json()

    // Validation
    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json({ error: "At least one package must be selected" }, { status: 400 })
    }

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")
    const billsCollection = db.collection<Bill>("bills")

    // Check if bill exists and belongs to user
    const existingBill = await billsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (!existingBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    const billCreationTime = new Date(existingBill.createdAt).getTime()
    const currentTime = new Date().getTime()
    const fifteenMinutesInMs = 15 * 60 * 1000 // 15 minutes in milliseconds

    const isWithinEditWindow = currentTime - billCreationTime <= fifteenMinutesInMs
    if (!isWithinEditWindow) {
      return NextResponse.json(
        { error: "This bill can no longer be edited. Bills can only be modified within 15 minutes of creation." },
        { status: 403 },
      )
    }

    // Fetch selected packages
    const packages = await packagesCollection
      .find({
        _id: { $in: packageIds.map((id: string) => new ObjectId(id)) },
        userId: new ObjectId(userId),
      })
      .toArray()

    if (packages.length !== packageIds.length) {
      return NextResponse.json({ error: "Some packages not found" }, { status: 400 })
    }

    // Create updated bill items
    const billItems: BillItem[] = packages.map((pkg) => ({
      packageId: pkg._id!,
      packageName: pkg.name,
      packagePrice: pkg.price,
      packageType: pkg.type,
    }))

    const servicesTotal = billItems.reduce((sum, item) => sum + item.packagePrice, 0)
    const productSalesTotal = productSales.reduce(
      (sum: number, product: any) => sum + product.price * product.quantity,
      0,
    )
    const expendituresTotal = expenditures.reduce((sum: number, exp: any) => sum + exp.amount, 0)

    let finalUpiAmount = 0
    let finalCardAmount = 0
    let finalCashAmount = 0

    const totalAmount = servicesTotal + productSalesTotal + expendituresTotal

    if (paymentMethod === "UPI") {
      finalUpiAmount = totalAmount
    } else if (paymentMethod === "CARD") {
      finalCardAmount = totalAmount
    } else if (paymentMethod === "CASH") {
      finalCashAmount = totalAmount
    }

    const result = await billsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          items: billItems,
          clientName: clientName || "Walk-in Customer",
          customerMobile: customerMobile || "",
          attendantBy: attendantBy || "",
          productSales: productSales,
          productSale: productSalesTotal,
          expenditures: expenditures,
          upiAmount: finalUpiAmount,
          cardAmount: finalCardAmount,
          cashAmount: finalCashAmount,
          paymentMethod: paymentMethod || "CASH",
          totalAmount: totalAmount,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bill updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Update bill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    const db = await getDatabase()
    const billsCollection = db.collection<Bill>("bills")

    const existingBill = await billsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (!existingBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    const billCreationTime = new Date(existingBill.createdAt).getTime()
    const currentTime = new Date().getTime()
    const fifteenMinutesInMs = 15 * 60 * 1000

    const isWithinEditWindow = currentTime - billCreationTime <= fifteenMinutesInMs
    if (!isWithinEditWindow) {
      return NextResponse.json(
        { error: "This bill can no longer be deleted. Bills can only be deleted within 15 minutes of creation." },
        { status: 403 },
      )
    }

    const result = await billsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bill deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete bill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
