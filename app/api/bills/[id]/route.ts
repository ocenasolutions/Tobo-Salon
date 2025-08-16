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

    const { packageIds } = await request.json()

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

    // Check if bill is within the last 15 bills (editable)
    const recentBills = await billsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray()

    const isEditable = recentBills.some((bill) => bill._id?.toString() === params.id)
    if (!isEditable) {
      return NextResponse.json(
        { error: "This bill is too old to edit. Only the last 15 bills can be modified." },
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

    // Calculate total
    const totalAmount = billItems.reduce((sum, item) => sum + item.packagePrice, 0)

    const result = await billsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          items: billItems,
          totalAmount,
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

    // Check if bill is within the last 15 bills (deletable)
    const recentBills = await billsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray()

    const isDeletable = recentBills.some((bill) => bill._id?.toString() === params.id)
    if (!isDeletable) {
      return NextResponse.json(
        { error: "This bill is too old to delete. Only the last 15 bills can be modified." },
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
