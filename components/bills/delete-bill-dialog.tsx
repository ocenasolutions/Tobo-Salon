"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import type { Bill } from "@/lib/models/Bill"

interface DeleteBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill
  onSuccess: () => void
}

export default function DeleteBillDialog({ open, onOpenChange, bill, onSuccess }: DeleteBillDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif">Delete Bill</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Bill #{bill._id?.toString().slice(-6).toUpperCase()}</h4>
            <div className="space-y-2">
              {bill.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.packageType === "Premium" ? "default" : "secondary"} className="text-xs">
                      {item.packageType}
                    </Badge>
                    <span>{item.packageName}</span>
                  </div>
                  <span className="font-medium">${item.packagePrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border/40 pt-2 mt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this bill? This will permanently remove it from your records.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Bill"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
