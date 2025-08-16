"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Calendar, TrendingUp, DollarSign, Package } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

interface ReportsData {
  period: string
  totalSales: number
  totalBills: number
  packageTypeDistribution: Array<{
    name: string
    value: number
    percentage: string
  }>
  topPackagesDistribution: Array<{
    name: string
    value: number
    count: number
    percentage: string
  }>
  salesTrend: Array<{
    date: string
    sales: number
    formattedDate: string
  }>
  dateRange: {
    start: string
    end: string
  }
}

const COLORS = ["#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff", "#faf5ff", "#581c87"]

const PERIOD_LABELS = {
  yesterday: "Yesterday",
  lastWeek: "Last Week",
  lastMonth: "Last Month",
  lastYear: "Last Year",
}

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof PERIOD_LABELS>("yesterday")
  const [loading, setLoading] = useState(true)

  const fetchReports = async (period: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/reports/sales?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReportsData(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(selectedPeriod)
  }, [selectedPeriod])

  const handlePeriodChange = (period: keyof typeof PERIOD_LABELS) => {
    setSelectedPeriod(period)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border/40 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`Revenue: $${payload[0].value.toFixed(2)}`}</p>
          <p className="text-muted-foreground">{`${payload[0].payload.percentage}% of total`}</p>
          {payload[0].payload.count && <p className="text-muted-foreground">{`Count: ${payload[0].payload.count}`}</p>}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <p className="text-muted-foreground">Analyze your salon's performance with detailed insights</p>
        </div>

        {/* Period Filter */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Period
            </CardTitle>
            <CardDescription>Select a time period to analyze your sales data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedPeriod === key ? "default" : "outline"}
                  onClick={() => handlePeriodChange(key as keyof typeof PERIOD_LABELS)}
                  className="bg-transparent"
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {reportsData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-primary">₹{reportsData.totalSales.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{PERIOD_LABELS[selectedPeriod]} performance</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-primary">{reportsData.totalBills}</div>
                  <p className="text-xs text-muted-foreground">Invoices generated</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-primary">
                    ₹
                    {reportsData.totalBills > 0 ? (reportsData.totalSales / reportsData.totalBills).toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            {reportsData.totalSales > 0 ? (
              <>
                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Package Type Distribution */}
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Sales by Package Type</CardTitle>
                      <CardDescription>Revenue distribution between Basic and Premium packages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportsData.packageTypeDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name} (${percentage}%)`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {reportsData.packageTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Packages */}
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Top Performing Packages</CardTitle>
                      <CardDescription>Revenue breakdown by individual service packages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportsData.topPackagesDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percentage }) => `${percentage}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {reportsData.topPackagesDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales Trend */}
                {reportsData.salesTrend.length > 1 && (
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Sales Trend</CardTitle>
                      <CardDescription>Daily sales performance over the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportsData.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="formattedDate" />
                            <YAxis />
                            <Tooltip
                              formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Bar dataKey="sales" fill={COLORS[0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Package Performance Table */}
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Package Performance Details</CardTitle>
                    <CardDescription>Detailed breakdown of package sales and revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportsData.topPackagesDistribution.map((pkg, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/40 rounded-lg gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div>
                              <h4 className="font-semibold">{pkg.name}</h4>
                              <p className="text-sm text-muted-foreground">{pkg.count} sales</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-lg font-semibold text-primary">₹{pkg.value.toFixed(2)}</div>
                            <Badge variant="outline">{pkg.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-serif font-semibold mb-2">No Sales Data</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    No sales found for {PERIOD_LABELS[selectedPeriod].toLowerCase()}. Try selecting a different time
                    period or create some bills first.
                  </p>
                  <Link href="/bills">
                    <Button>Create New Bill</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
