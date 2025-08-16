import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Bill } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { database } = await connectToDatabase()

    const billsCollection = database.collection<Bill>("bills")
    const packagesCollection = database.collection<Package>("packages")
    const inventoryCollection = database.collection("inventory")

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's bills
    const todaysBills = await billsCollection
      .find({
        userId: new ObjectId(decoded.userId),
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .toArray()

    // Calculate today's total sales
    const todaysTotalSales = todaysBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Find highest bill of the day
    const highestBillToday = todaysBills.reduce(
      (highest, bill) => (bill.totalAmount > highest.totalAmount ? bill : highest),
      { totalAmount: 0, _id: null, items: [], createdAt: new Date(), userId: new ObjectId(), updatedAt: new Date() },
    )

    // Get total number of packages
    const totalPackages = await packagesCollection.countDocuments({ userId: new ObjectId(decoded.userId) })

    // Get total number of bills
    const totalBills = await billsCollection.countDocuments({ userId: new ObjectId(decoded.userId) })

    const totalInventoryItems = await inventoryCollection.countDocuments({ userId: new ObjectId(decoded.userId) })

    const inventoryValue = await inventoryCollection
      .aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$total" },
            paidValue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$total", 0],
              },
            },
            unpaidValue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Unpaid"] }, "$total", 0],
              },
            },
          },
        },
      ])
      .toArray()

    const inventoryStats = inventoryValue[0] || { totalValue: 0, paidValue: 0, unpaidValue: 0 }

    // Get recent bills (last 15 for editing)
    const recentBills = await billsCollection
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray()

    // Get this week's sales
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeeksBills = await billsCollection
      .find({
        userId: new ObjectId(decoded.userId),
        createdAt: { $gte: startOfWeek },
      })
      .toArray()

    const thisWeeksTotalSales = thisWeeksBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    const thisWeeksInventory = await inventoryCollection
      .find({
        userId: new ObjectId(decoded.userId),
        dateEntered: { $gte: startOfWeek },
      })
      .toArray()

    const thisWeeksInventoryExpenses = thisWeeksInventory.reduce((sum: number, item: any) => sum + item.total, 0)

    // Get this month's sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthsBills = await billsCollection
      .find({
        userId: new ObjectId(decoded.userId),
        createdAt: { $gte: startOfMonth },
      })
      .toArray()

    const thisMonthsTotalSales = thisMonthsBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    const thisMonthsInventory = await inventoryCollection
      .find({
        userId: new ObjectId(decoded.userId),
        dateEntered: { $gte: startOfMonth },
      })
      .toArray()

    const thisMonthsInventoryExpenses = thisMonthsInventory.reduce((sum: number, item: any) => sum + item.total, 0)

    const thisWeeksProfit = thisWeeksTotalSales - thisWeeksInventoryExpenses
    const thisMonthsProfit = thisMonthsTotalSales - thisMonthsInventoryExpenses

    return NextResponse.json(
      {
        todaysTotalSales,
        highestBillToday: highestBillToday.totalAmount > 0 ? highestBillToday : null,
        totalPackages,
        totalBills,
        totalInventoryItems,
        inventoryStats,
        recentBills,
        thisWeeksTotalSales,
        thisMonthsTotalSales,
        thisWeeksInventoryExpenses,
        thisMonthsInventoryExpenses,
        thisWeeksProfit,
        thisMonthsProfit,
        todaysBillsCount: todaysBills.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
