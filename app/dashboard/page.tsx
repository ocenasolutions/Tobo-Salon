"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Package, Receipt, Edit, Trash2 } from "lucide-react"
import type { Bill } from "@/lib/models/Bill"
import Link from "next/link"
import EditBillDialog from "@/components/bills/edit-bill-dialog"
import DeleteBillDialog from "@/components/bills/delete-bill-dialog"
import type { Package as PackageType } from "@/lib/models/Package"
import DashboardLayout from "@/components/dashboard-layout"

interface DashboardAnalytics {
  todaysTotalSales: number
  highestBillToday: Bill | null
  totalPackages: number
  totalBills: number
  recentBills: Bill[]
  thisWeeksTotalSales: number
  thisMonthsTotalSales: number
  todaysBillsCount: number
  totalMorningPackages: number
  mostUsedPackage: { name: string; count: number } | null
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/dashboard/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchPackages()
  }, [])

  const handleBillUpdated = () => {
    fetchAnalytics()
    setEditingBill(null)
  }

  const handleBillDeleted = () => {
    fetchAnalytics()
    setDeletingBill(null)
  }

  const isBillEditable = (bill: Bill) => {
    const now = new Date()
    const billCreatedAt = new Date(bill.createdAt)
    const timeDifferenceInMinutes = (now.getTime() - billCreatedAt.getTime()) / (1000 * 60)
    return timeDifferenceInMinutes <= 15
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Morning Sales (12AM-12PM)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.todaysTotalSales.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.todaysBillsCount} bill{analytics.todaysBillsCount !== 1 ? "s" : ""} this morning
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Morning Bill</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.highestBillToday ? analytics.highestBillToday.totalAmount.toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.highestBillToday ? "Peak morning transaction" : "No morning bills"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">{analytics.totalPackages}</div>
                  <p className="text-xs text-muted-foreground">Active service packages</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">{analytics.totalBills}</div>
                  <p className="text-xs text-muted-foreground">All time invoices</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Morning Packages Done</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">{analytics.totalMorningPackages}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.mostUsedPackage
                      ? `Top: ${analytics.mostUsedPackage.name} (${analytics.mostUsedPackage.count}x)`
                      : "No packages used yet"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bills - Editable */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Morning Bills (12AM-12PM)</CardTitle>
                <CardDescription>
                  Bills from today's morning hours - editable within 15 minutes of creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentBills.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No morning bills created yet</p>
                    <Link href="/bills">
                      <Button className="mt-4">Create Your First Bill</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.recentBills.map((bill) => {
                      const isEditable = isBillEditable(bill)

                      return (
                        <div
                          key={bill._id?.toString()}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                              <h4 className="font-semibold">Bill #{bill._id?.toString().slice(-6).toUpperCase()}</h4>
                              <span className="text-2xl font-serif font-bold text-primary">
                                ₹{bill.totalAmount.toFixed(2)}
                              </span>
                              {!isEditable && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  Edit window expired
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {bill.items.slice(0, 3).map((item, index) => (
                                <Badge
                                  key={index}
                                  variant={item.packageType === "Premium" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {item.packageName}
                                </Badge>
                              ))}
                              {bill.items.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{bill.items.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(bill.createdAt).toLocaleDateString()} at{" "}
                              {new Date(bill.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2 self-start sm:self-center">
                            {isEditable ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingBill(bill)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingBill(bill)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground px-2">Read-only</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Dialogs */}
      {editingBill && (
        <EditBillDialog
          open={!!editingBill}
          onOpenChange={() => setEditingBill(null)}
          bill={editingBill}
          packages={packages}
          onSuccess={handleBillUpdated}
        />
      )}

      {deletingBill && (
        <DeleteBillDialog
          open={!!deletingBill}
          onOpenChange={() => setDeletingBill(null)}
          bill={deletingBill}
          onSuccess={handleBillDeleted}
        />
      )}

      {/* Fixed New Bill button at bottom center */}
      <Link href="/bills">
        <Button
          size="lg"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
        >
          <Receipt className="h-5 w-5 mr-2" />
          New Bill
        </Button>
      </Link>
    </DashboardLayout>
  )
}
