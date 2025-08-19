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

    // Get inventory items with aggregation (purchases)
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

    const billDateFilter: any = { userId: new ObjectId(decoded.userId) }

    if (period === "yesterday") {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)

      billDateFilter.createdAt = {
        $gte: yesterday,
        $lte: endOfYesterday,
      }
    } else if (period === "lastWeek") {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      billDateFilter.createdAt = { $gte: weekAgo }
    } else if (period === "lastMonth") {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      billDateFilter.createdAt = { $gte: monthAgo }
    } else if (period === "lastYear") {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      billDateFilter.createdAt = { $gte: yearAgo }
    } else if (period === "custom" && startDate && endDate) {
      billDateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Get bills with product sales
    const billsWithProductSales = await database
      .collection("bills")
      .find({
        ...billDateFilter,
        productSales: { $exists: true, $ne: [] },
      })
      .toArray()

    // Calculate product sales summary
    let totalProductsSold = 0
    let totalProductSalesAmount = 0
    const productSalesItems: any[] = []

    billsWithProductSales.forEach((bill: any) => {
      if (bill.productSales && Array.isArray(bill.productSales)) {
        bill.productSales.forEach((sale: any) => {
          totalProductsSold += sale.quantitySold
          totalProductSalesAmount += sale.totalPrice
          productSalesItems.push({
            ...sale,
            billId: bill._id,
            clientName: bill.clientName,
            soldAt: bill.createdAt,
          })
        })
      }
    })

    const billsWithExpenditures = await database
      .collection("bills")
      .find({
        ...billDateFilter,
        expenditures: { $exists: true, $ne: [] },
      })
      .toArray()

    let totalExpenditures = 0
    let totalExpenditureItems = 0
    const expenditureItems: any[] = []

    billsWithExpenditures.forEach((bill: any) => {
      if (bill.expenditures && Array.isArray(bill.expenditures)) {
        bill.expenditures.forEach((exp: any) => {
          totalExpenditures += exp.price
          totalExpenditureItems += 1
          expenditureItems.push({
            ...exp,
            billId: bill._id,
            clientName: bill.clientName,
            addedAt: bill.createdAt,
          })
        })
      }
    })

    // Get daily breakdown for charts (purchases)
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

    const dailySalesPipeline = [
      { $match: billDateFilter },
      { $unwind: "$productSales" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          dailySalesTotal: { $sum: "$productSales.totalPrice" },
          dailySalesItems: { $sum: "$productSales.quantitySold" },
        },
      },
      { $sort: { _id: 1 } },
    ]

    const dailySalesBreakdown = await database.collection("bills").aggregate(dailySalesPipeline).toArray()

    const dailyExpendituresPipeline = [
      { $match: billDateFilter },
      { $unwind: "$expenditures" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          dailyExpendituresTotal: { $sum: "$expenditures.price" },
          dailyExpendituresItems: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]

    const dailyExpendituresBreakdown = await database.collection("bills").aggregate(dailyExpendituresPipeline).toArray()

    return NextResponse.json({
      summary: {
        ...summary,
        productSales: {
          totalProductsSold,
          totalProductSalesAmount,
          items: productSalesItems,
        },
        expenditures: {
          totalExpenditures,
          totalExpenditureItems,
          items: expenditureItems,
        },
      },
      dailyBreakdown,
      dailySalesBreakdown,
      dailyExpendituresBreakdown,
      period: period || "all",
    })
  } catch (error) {
    console.error("Error fetching expense report:", error)
    return NextResponse.json({ error: "Failed to fetch expense report" }, { status: 500 })
  }
}
