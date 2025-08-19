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
    const { name, brandName, category, quantity, shadesCode, stockIn, pricePerUnit, expiryDate, paymentStatus } = body
    if (!name || !brandName || !category || !quantity || !stockIn || !pricePerUnit) {
      return NextResponse.json({ 
        error: "Item Name, Brand Name, Category, Quantity, Stock In, and Unit Price are required" 
      }, { status: 400 })
    }

    if (quantity <= 0 || stockIn <= 0 || pricePerUnit <= 0) {
      return NextResponse.json({ 
        error: "Quantity, Stock In, and Unit Price must be positive numbers" 
      }, { status: 400 })
    }
    const total = quantity * pricePerUnit
    const updateData = {
      name,
      brandName,
      category,
      quantity: Number(quantity),
      shadesCode: shadesCode || undefined,
      stockIn: Number(stockIn),
      pricePerUnit: Number(pricePerUnit),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
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
