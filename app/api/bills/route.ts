import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Bill, BillItem } from "@/lib/models/Bill"
import type { Package, ProductSale } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { WhatsAppService } from "@/lib/whatsapp"

export const runtime = "nodejs"

function verifyToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET not configured")
      return null
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = verifyToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const billsCollection = db.collection<Bill>("bills")

    const bills = await billsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ bills }, { status: 200 })
  } catch (error) {
    console.error("Get bills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = verifyToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      packageIds,
      clientName,
      customerMobile,
      upiAmount,
      cardAmount,
      cashAmount,
      attendantBy,
      productSales,
      expenditures,
    } = await request.json()

    // Validation
    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json({ error: "At least one service must be selected" }, { status: 400 })
    }

    if (!attendantBy || !attendantBy.trim()) {
      return NextResponse.json({ error: "Attendant name is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")
    const billsCollection = db.collection<Bill>("bills")
    const inventoryCollection = db.collection("inventory")

    // Fetch selected packages
    const packages = await packagesCollection
      .find({
        _id: { $in: packageIds.map((id: string) => new ObjectId(id)) },
        userId: new ObjectId(userId),
      })
      .toArray()

    if (packages.length !== packageIds.length) {
      return NextResponse.json({ error: "Some services not found" }, { status: 400 })
    }

    // Create bill items
    const billItems: BillItem[] = packages.map((pkg) => ({
      packageId: pkg._id!,
      packageName: pkg.name,
      packagePrice: pkg.price,
      packageType: pkg.type,
    }))

    let productSalesTotal = 0
    const processedProductSales: ProductSale[] = []

    if (productSales && Array.isArray(productSales)) {
      for (const sale of productSales) {
        const { inventoryId, quantitySold } = sale

        // Fetch inventory item
        const inventoryItem = await inventoryCollection.findOne({
          _id: new ObjectId(inventoryId),
          userId: new ObjectId(userId),
        })

        if (!inventoryItem) {
          return NextResponse.json({ error: `Product not found: ${inventoryId}` }, { status: 400 })
        }

        if (inventoryItem.quantity < quantitySold) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${quantitySold}`,
            },
            { status: 400 },
          )
        }

        // Update inventory quantity
        await inventoryCollection.updateOne(
          { _id: new ObjectId(inventoryId) },
          {
            $inc: { quantity: -quantitySold },
            $set: { updatedAt: new Date() },
          },
        )

        const saleTotal = quantitySold * inventoryItem.pricePerUnit
        productSalesTotal += saleTotal

        processedProductSales.push({
          inventoryId: new ObjectId(inventoryId),
          productName: inventoryItem.name,
          brandName: inventoryItem.brandName,
          quantitySold,
          pricePerUnit: inventoryItem.pricePerUnit,
          totalPrice: saleTotal,
        })
      }
    }

    let expendituresTotal = 0
    const processedExpenditures = expenditures || []

    if (expenditures && Array.isArray(expenditures)) {
      expendituresTotal = expenditures.reduce((sum: number, exp: any) => sum + (exp.price || 0), 0)
    }

    // Calculate total
    const servicesTotal = billItems.reduce((sum, item) => sum + item.packagePrice, 0)
    const totalAmount = servicesTotal + productSalesTotal + expendituresTotal

    const processedClientName = clientName?.trim() || "Walk-in Customer"

    const newBill: Bill = {
      userId: new ObjectId(userId),
      items: billItems,
      totalAmount,
      clientName: processedClientName,
      customerMobile: customerMobile?.trim() || undefined,
      upiAmount: upiAmount || 0,
      cardAmount: cardAmount || 0,
      cashAmount: cashAmount || 0,
      attendantBy: attendantBy.trim(),
      productSale: productSalesTotal,
      productSales: processedProductSales,
      expenditures: processedExpenditures,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await billsCollection.insertOne(newBill)

    try {
      await WhatsAppService.sendAdminBillNotification(totalAmount, processedClientName)
    } catch (whatsappError) {
      console.error("WhatsApp notification failed:", whatsappError)
      // Continue with success response even if WhatsApp fails
    }

    return NextResponse.json(
      { message: "Daily sheet entry created successfully", billId: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create bill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
