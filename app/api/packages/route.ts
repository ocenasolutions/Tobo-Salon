import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId
    // </CHANGE>

    const db = await getDatabase()
    const packagesCollection = db.collection<Package>("packages")

    const packages = await packagesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ packages }, { status: 200 })
  } catch (error) {
    console.error("Get packages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId
    // </CHANGE>

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

    const newPackage: Package = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      type,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await packagesCollection.insertOne(newPackage)

    return NextResponse.json({ message: "Package created successfully", packageId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create package error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
