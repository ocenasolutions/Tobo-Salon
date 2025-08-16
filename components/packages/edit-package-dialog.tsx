"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Package } from "@/lib/models/Package"

interface EditPackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  package: Package
  onSuccess: () => void
}

export default function EditPackageDialog({ open, onOpenChange, package: pkg, onSuccess }: EditPackageDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.toString(),
        type: pkg.type,
      })
    }
  }, [pkg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name || !formData.description || !formData.price || !formData.type) {
      setError("All fields are required")
      return
    }

    const price = Number.parseFloat(formData.price)
    if (Number.isNaN(price) || price <= 0) {
      setError("Please enter a valid price")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/packages/${pkg._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price,
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Package</DialogTitle>
          <DialogDescription>Update your service package details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">Package Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Premium Hair Treatment"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe what's included in this package..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Package Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Package"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
