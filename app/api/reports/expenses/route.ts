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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const { database } = await connectToDatabase()

    const dateFilter: any = { userId: new ObjectId(decoded.userId) }
    const now = new Date()

    // Calculate date ranges based on period
    if (period === "yesterday") {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)

      dateFilter.dateEntered = {
        $gte: yesterday,
        $lte: endOfYesterday,
      }
    } else if (period === "lastWeek") {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter.dateEntered = { $gte: weekAgo }
    } else if (period === "lastMonth") {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter.dateEntered = { $gte: monthAgo }
    } else if (period === "lastYear") {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      dateFilter.dateEntered = { $gte: yearAgo }
    } else if (period === "custom" && startDate && endDate) {
      dateFilter.dateEntered = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Get inventory items with aggregation
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$total" },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$total", 0],
            },
          },
          unpaidAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Unpaid"] }, "$total", 0],
            },
          },
          items: { $push: "$$ROOT" },
        },
      },
    ]

    const result = await database.collection("inventory").aggregate(pipeline).toArray()

    const summary = result[0] || {
      totalItems: 0,
      totalQuantity: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      items: [],
    }

    // Get daily breakdown for charts
    const dailyPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateEntered" },
          },
          dailyTotal: { $sum: "$total" },
          dailyItems: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]

    const dailyBreakdown = await database.collection("inventory").aggregate(dailyPipeline).toArray()

    return NextResponse.json({
      summary,
      dailyBreakdown,
      period: period || "all",
    })
  } catch (error) {
    console.error("Error fetching expense report:", error)
    return NextResponse.json({ error: "Failed to fetch expense report" }, { status: 500 })
  }
}
