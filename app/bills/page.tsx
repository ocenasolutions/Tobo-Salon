"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, Edit, Trash2, Share2 } from "lucide-react"
import type { Bill } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"
import CreateBillDialog from "@/components/bills/create-bill-dialog"
import EditBillDialog from "@/components/bills/edit-bill-dialog"
import DeleteBillDialog from "@/components/bills/delete-bill-dialog"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { shareToWhatsApp } from "@/lib/utils/shareToWhatsApp"

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/bills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBills(data.bills)
      }
    } catch (error) {
      console.error("Error fetching bills:", error)
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
    fetchBills()
    fetchPackages()
  }, [])

  const handleBillCreated = () => {
    fetchBills()
    setShowCreateDialog(false)
  }

  const handleBillUpdated = () => {
    fetchBills()
    setEditingBill(null)
  }

  const handleBillDeleted = () => {
    fetchBills()
    setDeletingBill(null)
  }

  const isEditable = (bill: Bill, index: number) => {
    const billCreationTime = new Date(bill.createdAt).getTime()
    const currentTime = new Date().getTime()
    const fifteenMinutesInMs = 15 * 60 * 1000 // 15 minutes in milliseconds

    return currentTime - billCreationTime <= fifteenMinutesInMs
  }

  const getTimeRemaining = (bill: Bill) => {
    const billCreationTime = new Date(bill.createdAt).getTime()
    const currentTime = new Date().getTime()
    const fifteenMinutesInMs = 15 * 60 * 1000
    const timeElapsed = currentTime - billCreationTime
    const timeRemaining = fifteenMinutesInMs - timeElapsed

    if (timeRemaining <= 0) return "Expired"

    const minutesRemaining = Math.floor(timeRemaining / (60 * 1000))
    const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000)

    return `${minutesRemaining}m ${secondsRemaining}s remaining`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Create and manage your salon bills</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="gap-2 self-start sm:self-auto"
            disabled={packages.length === 0}
          >
            <Plus className="h-5 w-5" />
            Create Bill
          </Button>
        </div>

        {packages.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2">No packages available</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                You need to create some packages first before you can generate bills
              </p>
              <Link href="/packages">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Packages
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : bills.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2">No bills yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first bill by selecting packages and generating an invoice
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Bill
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bills.map((bill, index) => (
              <Card key={bill._id?.toString()} className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-serif mb-2">
                        Bill #{bill._id?.toString().slice(-6).toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        Created on {new Date(bill.createdAt).toLocaleDateString()} at{" "}
                        {new Date(bill.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-3xl font-serif font-bold text-primary">₹{bill.totalAmount.toFixed(2)}</span>
                      <div className="flex gap-1">
                        {bill.customerMobile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareToWhatsApp(bill)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isEditable(bill, index) && (
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
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-semibold text-foreground">Services Included:</h4>
                      {bill.customerMobile && (
                        <span className="text-sm text-muted-foreground">Customer: {bill.customerMobile}</span>
                      )}
                    </div>
                    {bill.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border/20 last:border-0 gap-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Badge variant={item.packageType === "Premium" ? "default" : "secondary"}>
                            {item.packageType}
                          </Badge>
                          <span className="font-medium">{item.packageName}</span>
                        </div>
                        <span className="font-semibold text-primary">₹{item.packagePrice.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-border/40 gap-2">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-serif font-bold text-primary">₹{bill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  {!isEditable(bill, index) && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        This bill can no longer be edited. Bills can only be modified within 15 minutes of creation.
                      </p>
                    </div>
                  )}
                  {isEditable(bill, index) && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">Edit window: {getTimeRemaining(bill)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateBillDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        packages={packages}
        onSuccess={handleBillCreated}
      />

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
    </DashboardLayout>
  )
}
