import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
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

    const inventory = await database
      .collection("inventory")
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { name, expiryDate, quantity, pricePerUnit, paymentStatus = "Unpaid" } = body

    // Validation
    if (!name || !quantity || !pricePerUnit) {
      return NextResponse.json({ error: "Name, quantity, and price per unit are required" }, { status: 400 })
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return NextResponse.json({ error: "Quantity and price must be positive numbers" }, { status: 400 })
    }

    const total = quantity * pricePerUnit
    const now = new Date()

    const inventoryItem = {
      name,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      total,
      paymentStatus,
      dateEntered: now,
      userId: new ObjectId(decoded.userId),
      createdAt: now,
      updatedAt: now,
    }

    const { database } = await connectToDatabase()
    const result = await database.collection("inventory").insertOne(inventoryItem)

    return NextResponse.json(
      {
        message: "Inventory item added successfully",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding inventory item:", error)
    return NextResponse.json({ error: "Failed to add inventory item" }, { status: 500 })
  }
}
