import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Bill } from "@/lib/models/Bill"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "yesterday"

    const db = await getDatabase()
    const billsCollection = db.collection<Bill>("bills")

    // Calculate date ranges based on period
    const now = new Date()
    let startDate: Date
    let endDate: Date = new Date()

    switch (period) {
      case "yesterday":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "lastWeek":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "lastYear":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    }

    // Get bills for the specified period
    const bills = await billsCollection
      .find({
        userId: new ObjectId(userId),
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .toArray()

    // Calculate total sales
    const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Group sales by package type for pie chart
    const packageTypeDistribution: { [key: string]: number } = {}
    const packageDistribution: { [key: string]: { count: number; revenue: number } } = {}

    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        // Package type distribution
        if (!packageTypeDistribution[item.packageType]) {
          packageTypeDistribution[item.packageType] = 0
        }
        packageTypeDistribution[item.packageType] += item.packagePrice

        // Individual package distribution
        if (!packageDistribution[item.packageName]) {
          packageDistribution[item.packageName] = { count: 0, revenue: 0 }
        }
        packageDistribution[item.packageName].count += 1
        packageDistribution[item.packageName].revenue += item.packagePrice
      })
    })

    // Format data for pie charts
    const packageTypeChartData = Object.entries(packageTypeDistribution).map(([type, revenue]) => ({
      name: type,
      value: revenue,
      percentage: totalSales > 0 ? ((revenue / totalSales) * 100).toFixed(1) : "0",
    }))

    const topPackagesChartData = Object.entries(packageDistribution)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 8) // Top 8 packages
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        value: data.revenue,
        count: data.count,
        percentage: totalSales > 0 ? ((data.revenue / totalSales) * 100).toFixed(1) : "0",
      }))

    // Daily sales trend for the period
    const dailySales: { [key: string]: number } = {}
    bills.forEach((bill) => {
      const dateKey = bill.createdAt.toISOString().split("T")[0]
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = 0
      }
      dailySales[dateKey] += bill.totalAmount
    })

    const salesTrendData = Object.entries(dailySales)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sales]) => ({
        date,
        sales,
        formattedDate: new Date(date).toLocaleDateString(),
      }))

    return NextResponse.json(
      {
        period,
        totalSales,
        totalBills: bills.length,
        packageTypeDistribution: packageTypeChartData,
        topPackagesDistribution: topPackagesChartData,
        salesTrend: salesTrendData,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Reports sales error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
