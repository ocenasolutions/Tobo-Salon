import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Bill, BillItem } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

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

    const { packageIds } = await request.json()

    // Validation
    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json({ error: "At least one package must be selected" }, { status: 400 })
    }

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")
    const billsCollection = db.collection<Bill>("bills")

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

    // Create bill items
    const billItems: BillItem[] = packages.map((pkg) => ({
      packageId: pkg._id!,
      packageName: pkg.name,
      packagePrice: pkg.price,
      packageType: pkg.type,
    }))

    // Calculate total
    const totalAmount = billItems.reduce((sum, item) => sum + item.packagePrice, 0)

    const newBill: Bill = {
      userId: new ObjectId(userId),
      items: billItems,
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await billsCollection.insertOne(newBill)

    return NextResponse.json({ message: "Bill created successfully", billId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create bill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
