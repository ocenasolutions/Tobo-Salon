import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export const runtime = "nodejs"

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return null
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, type } = await request.json()

    // Validation
    if (!name || !description || !price || !type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
    }

    if (!["Basic", "Premium"].includes(type)) {
      return NextResponse.json({ error: "Type must be Basic or Premium" }, { status: 400 })
    }

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")

    const result = await packagesCollection.updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          type,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Package updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Update package error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")

    const result = await packagesCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Package deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete package error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
