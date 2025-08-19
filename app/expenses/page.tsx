"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Package, DollarSign, Loader2, ShoppingCart, Receipt } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface ExpenseReport {
  summary: {
    totalItems: number
    totalQuantity: number
    totalAmount: number
    paidAmount: number
    unpaidAmount: number
    items: any[]
    productSales: {
      totalProductsSold: number
      totalProductSalesAmount: number
      items: any[]
    }
    expenditures: {
      totalExpenditures: number
      totalExpenditureItems: number
      items: any[]
    }
  }
  dailyBreakdown: Array<{
    _id: string
    dailyTotal: number
    dailyItems: number
  }>
  dailySalesBreakdown: Array<{
    _id: string
    dailySalesTotal: number
    dailySalesItems: number
  }>
  dailyExpendituresBreakdown: Array<{
    _id: string
    dailyExpendituresTotal: number
    dailyExpendituresItems: number
  }>
  period: string
}

export default function ExpensesPage() {
  const [report, setReport] = useState<ExpenseReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("lastMonth")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const { toast } = useToast()

  const fetchExpenseReport = async (period: string, startDate?: string, endDate?: string) => {
    setIsLoading(true)
    try {
      let url = `/api/reports/expenses?period=${period}`
      if (period === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch expense report")

      const data = await response.json()
      setReport(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expense report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPeriod === "custom") {
      if (customStartDate && customEndDate) {
        fetchExpenseReport(selectedPeriod, customStartDate, customEndDate)
      }
    } else {
      fetchExpenseReport(selectedPeriod)
    }
  }, [selectedPeriod, customStartDate, customEndDate])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== "custom") {
      setCustomStartDate("")
      setCustomEndDate("")
    }
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "yesterday":
        return "Yesterday"
      case "lastWeek":
        return "Last 7 Days"
      case "lastMonth":
        return "Last 30 Days"
      case "lastYear":
        return "Last Year"
      case "custom":
        return customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : "Custom Period"
      default:
        return "All Time"
    }
  }

  const formatChartData = () => {
    if (!report?.dailyBreakdown && !report?.dailySalesBreakdown && !report?.dailyExpendituresBreakdown) return []

    const purchaseData = report.dailyBreakdown || []
    const salesData = report.dailySalesBreakdown || []
    const expendituresData = report.dailyExpendituresBreakdown || []

    const combinedData: { [key: string]: any } = {}

    purchaseData.forEach((day) => {
      const date = new Date(day._id).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      combinedData[day._id] = {
        date,
        purchases: day.dailyTotal,
        purchaseItems: day.dailyItems,
        sales: 0,
        salesItems: 0,
        expenditures: 0,
        expenditureItems: 0,
      }
    })

    salesData.forEach((day) => {
      const date = new Date(day._id).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (combinedData[day._id]) {
        combinedData[day._id].sales = day.dailySalesTotal
        combinedData[day._id].salesItems = day.dailySalesItems
      } else {
        combinedData[day._id] = {
          date,
          purchases: 0,
          purchaseItems: 0,
          sales: day.dailySalesTotal,
          salesItems: day.dailySalesItems,
          expenditures: 0,
          expenditureItems: 0,
        }
      }
    })

    expendituresData.forEach((day) => {
      const date = new Date(day._id).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (combinedData[day._id]) {
        combinedData[day._id].expenditures = day.dailyExpendituresTotal
        combinedData[day._id].expenditureItems = day.dailyExpendituresItems
      } else {
        combinedData[day._id] = {
          date,
          purchases: 0,
          purchaseItems: 0,
          sales: 0,
          salesItems: 0,
          expenditures: day.dailyExpendituresTotal,
          expenditureItems: day.dailyExpendituresItems,
        }
      }
    })

    return Object.values(combinedData).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading expense report...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Expense Report</h1>
            <p className="text-muted-foreground">Track your inventory purchases, product sales, and expenditures</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === "custom" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Period Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Summary Stats */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Purchased
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.summary.totalItems}</div>
                  <p className="text-xs text-muted-foreground">{report.summary.totalQuantity} total quantity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Purchase Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">₹{report.summary.totalAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total expenses for period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Products Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {report.summary.productSales.totalProductsSold}
                  </div>
                  <p className="text-xs text-muted-foreground">Items sold to customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sales Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{report.summary.productSales.totalProductSalesAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Revenue from product sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Expenditures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{report.summary.expenditures?.totalExpenditures?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report.summary.expenditures?.totalExpenditureItems || 0} expense items
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Net Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      (
                        report.summary.productSales.totalProductSalesAmount -
                          report.summary.totalAmount -
                          (report.summary.expenditures?.totalExpenditures || 0)
                      ) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹
                    {(
                      report.summary.productSales.totalProductSalesAmount -
                      report.summary.totalAmount -
                      (report.summary.expenditures?.totalExpenditures || 0)
                    ).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Sales - Purchases - Expenditures</p>
                </CardContent>
              </Card>
            </div>

            {(report.dailyBreakdown.length > 0 ||
              report.dailySalesBreakdown.length > 0 ||
              report.dailyExpendituresBreakdown?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Financial Activity</CardTitle>
                    <CardDescription>Purchases vs Sales vs Expenditures comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            `₹${Number(value).toFixed(2)}`,
                            name === "purchases" ? "Purchases" : name === "sales" ? "Sales" : "Expenditures",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="purchases"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444" }}
                          name="purchases"
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                          name="sales"
                        />
                        <Line
                          type="monotone"
                          dataKey="expenditures"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ fill: "#f97316" }}
                          name="expenditures"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Item Activity</CardTitle>
                    <CardDescription>Items purchased vs sold vs expenditure items per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "purchaseItems"
                              ? "Items Purchased"
                              : name === "salesItems"
                                ? "Items Sold"
                                : "Expenditure Items",
                          ]}
                        />
                        <Bar dataKey="purchaseItems" fill="#ef4444" name="purchaseItems" />
                        <Bar dataKey="salesItems" fill="#10b981" name="salesItems" />
                        <Bar dataKey="expenditureItems" fill="#f97316" name="expenditureItems" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {report.summary.expenditures?.items?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenditures</CardTitle>
                  <CardDescription>Manual expenses added to bills in this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.summary.expenditures.items.slice(0, 10).map((exp: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{exp.name}</h4>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                              EXPENSE
                            </Badge>
                          </div>
                          {exp.description && <div className="text-sm text-muted-foreground">{exp.description}</div>}
                          <div className="text-xs text-muted-foreground">
                            Added to bill for: {exp.clientName} on {new Date(exp.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">-₹{exp.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {report.summary.expenditures.items.length > 10 && (
                      <p className="text-center text-muted-foreground">
                        And {report.summary.expenditures.items.length - 10} more expenditures...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.summary.productSales.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Product Sales</CardTitle>
                  <CardDescription>Products sold to customers in this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.summary.productSales.items.slice(0, 10).map((sale: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{sale.productName}</h4>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              {sale.brandName}
                            </Badge>
                            <Badge variant="secondary">SOLD</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {sale.quantitySold} × ₹{sale.pricePerUnit.toFixed(2)} = ₹{sale.totalPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sold to: {sale.clientName} on {new Date(sale.soldAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">+₹{sale.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {report.summary.productSales.items.length > 10 && (
                      <p className="text-center text-muted-foreground">
                        And {report.summary.productSales.items.length - 10} more sales...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Purchases */}
            {report.summary.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>Items purchased for inventory in this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.summary.items.slice(0, 10).map((item: any) => (
                      <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant={item.paymentStatus === "Paid" ? "default" : "destructive"}>
                              {item.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.pricePerUnit.toFixed(2)} = ₹{item.total.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.dateEntered).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">-₹{item.total.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {report.summary.items.length > 10 && (
                      <p className="text-center text-muted-foreground">
                        And {report.summary.items.length - 10} more items...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data State */}
            {report.summary.totalItems === 0 &&
              report.summary.productSales.totalProductsSold === 0 &&
              (report.summary.expenditures?.totalExpenditureItems || 0) === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No activity found</h3>
                    <p className="text-muted-foreground">
                      No inventory items were purchased, sold, or expenditures added during the selected period.
                    </p>
                  </CardContent>
                </Card>
              )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
