"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Package, Receipt, Calendar, User, MessageCircle } from "lucide-react"
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
  todaysExpenditures: number
  thisWeeksExpenditures: number
  thisMonthsExpenditures: number
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
        console.log("[v0] Dashboard analytics data received:", data)
        console.log("[v0] Recent bills from API:", data.recentBills?.length || 0)
        console.log(
          "[v0] Recent bills data:",
          data.recentBills?.map((bill: any) => ({
            id: bill._id,
            clientName: bill.clientName,
            totalAmount: bill.totalAmount,
            createdAt: bill.createdAt,
          })),
        )
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

  const handleWhatsAppShare = (bill: Bill) => {
    if (!bill.customerMobile) return

    const message = `Hello ${bill.clientName}! 🌸

Your bill from *HUSN Beauty Salon* has been processed.

💰 *Total Amount: ₹${(bill.upiAmount + bill.cardAmount + bill.cashAmount + bill.productSale).toFixed(2)}*

Thank you for visiting HUSN Beauty Salon! ✨
We hope you loved your experience with us.

Visit us again soon! 💕`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${bill.customerMobile.replace(/[^0-9]/g, "")}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
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
            <div className="text-center border-b pb-6">
              <h1 className="text-4xl font-serif font-bold mb-2">Daily Bills</h1>
              <div className="flex justify-center items-center gap-8 text-lg">
                <span className="font-semibold">Salon: HUSN Beauty</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.todaysTotalSales.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.todaysBillsCount} bill{analytics.todaysBillsCount !== 1 ? "s" : ""} today
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Bill Today</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.highestBillToday ? analytics.highestBillToday.totalAmount.toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.highestBillToday ? "Peak transaction today" : "No bills today"}
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
            </div>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Today's Daily Bill Entries</CardTitle>
                <CardDescription>Complete record of today's salon activities with payment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentBills.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bills created yet today</p>
                    <Link href="/bills">
                      <Button className="mt-4">Create First Bill</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-10 gap-4 p-3 bg-muted/50 rounded-lg font-semibold text-sm">
                      <div>Sr No.</div>
                      <div>Client Name</div>
                      <div>Services</div>
                      <div>UPI</div>
                      <div>Card</div>
                      <div>Cash</div>
                      <div>Attendant By</div>
                      <div>Product Sale</div>
                      <div>Complimentary Add-Ons</div>
                      <div>Grand Total</div>
                    </div>

                    {/* Table Rows */}
                    {analytics.recentBills.map((bill, index) => {
                      const isEditable = isBillEditable(bill)
                      const srNo = analytics.recentBills.length - index
                      const expenditureTotal = bill.expenditures?.reduce((sum, exp) => sum + exp.amount, 0) || 0
                      const billGrandTotal = bill.totalAmount

                      return (
                        <div
                          key={bill._id?.toString()}
                          className="grid grid-cols-10 gap-4 p-3 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors text-sm"
                        >
                          <div className="font-medium">{srNo}</div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-medium">{bill.clientName}</span>
                              {bill.customerMobile && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-muted-foreground">{bill.customerMobile}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleWhatsAppShare(bill)}
                                    title="Share bill on WhatsApp"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {bill.items.slice(0, 2).map((item, itemIndex) => (
                              <Badge
                                key={itemIndex}
                                variant={item.packageType === "Premium" ? "default" : "secondary"}
                                className="text-xs mr-1"
                              >
                                {item.packageName}
                              </Badge>
                            ))}
                            {bill.items.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{bill.items.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="text-green-600 font-medium">
                            {bill.upiAmount > 0 ? `₹${bill.upiAmount.toFixed(2)}` : "-"}
                          </div>
                          <div className="text-blue-600 font-medium">
                            {bill.cardAmount > 0 ? `₹${bill.cardAmount.toFixed(2)}` : "-"}
                          </div>
                          <div className="text-orange-600 font-medium">
                            {bill.cashAmount > 0 ? `₹${bill.cashAmount.toFixed(2)}` : "-"}
                          </div>
                          <div className="font-medium">{bill.attendantBy}</div>
                          <div className="text-purple-600 font-medium">
                            {bill.productSale > 0 ? `₹${bill.productSale.toFixed(2)}` : "-"}
                          </div>
                          <div className="text-red-600 font-medium">
                            {expenditureTotal > 0 ? `₹${expenditureTotal.toFixed(2)}` : "-"}
                          </div>
                          <div className="text-primary font-bold">₹{billGrandTotal.toFixed(2)}</div>
                        </div>
                      )
                    })}

                    {/* Total Row */}
                    <div className="grid grid-cols-10 gap-4 p-3 bg-primary/10 rounded-lg font-bold text-sm border-2 border-primary/20">
                      <div>TOTAL</div>
                      <div>{analytics.recentBills.length} Clients</div>
                      <div>{analytics.totalMorningPackages} Services</div>
                      <div className="text-green-600">
                        ₹{analytics.recentBills.reduce((sum, bill) => sum + bill.upiAmount, 0).toFixed(2)}
                      </div>
                      <div className="text-blue-600">
                        ₹{analytics.recentBills.reduce((sum, bill) => sum + bill.cardAmount, 0).toFixed(2)}
                      </div>
                      <div className="text-orange-600">
                        ₹{analytics.recentBills.reduce((sum, bill) => sum + bill.cashAmount, 0).toFixed(2)}
                      </div>
                      <div>-</div>
                      <div className="text-purple-600">
                        ₹{analytics.recentBills.reduce((sum, bill) => sum + bill.productSale, 0).toFixed(2)}
                      </div>
                      <div className="text-red-600">₹{(analytics.todaysExpenditures || 0).toFixed(2)}</div>
                      <div className="text-primary font-bold text-lg">
                        ₹{analytics.recentBills.reduce((sum, bill) => sum + bill.totalAmount, 0).toFixed(2)}
                      </div>
                    </div>
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
