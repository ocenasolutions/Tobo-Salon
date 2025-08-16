import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()

    const { name, expiryDate, quantity, pricePerUnit, paymentStatus } = body

    // Validation
    if (!name || !quantity || !pricePerUnit) {
      return NextResponse.json({ error: "Name, quantity, and price per unit are required" }, { status: 400 })
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return NextResponse.json({ error: "Quantity and price must be positive numbers" }, { status: 400 })
    }

    const total = quantity * pricePerUnit

    const updateData = {
      name,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      total,
      paymentStatus,
      updatedAt: new Date(),
    }

    const { database } = await connectToDatabase()
    const result = await database.collection("inventory").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(decoded.userId),
      },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Inventory item updated successfully" })
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { database } = await connectToDatabase()

    const result = await database.collection("inventory").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(decoded.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
  }
}
