"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import type { Bill } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"

interface EditBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill
  packages: Package[]
  onSuccess: () => void
}

export default function EditBillDialog({ open, onOpenChange, bill, packages, onSuccess }: EditBillDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (bill) {
      setSelectedPackages(bill.items.map((item) => item.packageId.toString()))
    }
  }, [bill])

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId],
    )
  }

  const calculateTotal = () => {
    return packages
      .filter((pkg) => selectedPackages.includes(pkg._id!.toString()))
      .reduce((sum, pkg) => sum + pkg.price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedPackages.length === 0) {
      setError("Please select at least one package")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/bills/${bill._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageIds: selectedPackages,
        }),
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Bill</DialogTitle>
          <DialogDescription>
            Update packages for Bill #{bill._id?.toString().slice(-6).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Packages:</Label>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg._id?.toString()}
                  className="flex items-center space-x-3 p-3 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`edit-${pkg._id?.toString()}`}
                    checked={selectedPackages.includes(pkg._id!.toString())}
                    onCheckedChange={() => handlePackageToggle(pkg._id!.toString())}
                    disabled={loading}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={`edit-${pkg._id?.toString()}`} className="font-medium cursor-pointer">
                        {pkg.name}
                      </Label>
                      <Badge variant={pkg.type === "Premium" ? "default" : "secondary"}>{pkg.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-primary">₹{pkg.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPackages.length > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Updated Total:</span>
                <span className="text-2xl font-serif font-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPackages.length} package{selectedPackages.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedPackages.length === 0} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Bill...
                </>
              ) : (
                "Update Bill"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
