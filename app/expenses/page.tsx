"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Package, DollarSign, Loader2 } from "lucide-react"
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
  }
  dailyBreakdown: Array<{
    _id: string
    dailyTotal: number
    dailyItems: number
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
    if (!report?.dailyBreakdown) return []

    return report.dailyBreakdown.map((day) => ({
      date: new Date(day._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: day.dailyTotal,
      items: day.dailyItems,
    }))
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
            <p className="text-muted-foreground">Track your inventory purchases and expenses</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Total Items
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
                    Total Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{report.summary.totalAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total expenses for period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Paid Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{report.summary.paidAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.summary.totalAmount > 0
                      ? `${((report.summary.paidAmount / report.summary.totalAmount) * 100).toFixed(1)}% of total`
                      : "0% of total"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Unpaid Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">₹{report.summary.unpaidAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.summary.totalAmount > 0
                      ? `${((report.summary.unpaidAmount / report.summary.totalAmount) * 100).toFixed(1)}% of total`
                      : "0% of total"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            {report.dailyBreakdown.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Spending Trend</CardTitle>
                    <CardDescription>Amount spent per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Amount"]} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Items Purchased</CardTitle>
                    <CardDescription>Number of items bought per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, "Items"]} />
                        <Bar dataKey="items" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Items */}
            {report.summary.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>Items purchased in this period</CardDescription>
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
                          <div className="font-semibold">₹{item.total.toFixed(2)}</div>
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
            {report.summary.totalItems === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No purchases found</h3>
                  <p className="text-muted-foreground">No inventory items were purchased during the selected period.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
