"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import type { Package } from "@/lib/models/Package"

interface DeletePackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  package: Package
  onSuccess: () => void
}

export default function DeletePackageDialog({ open, onOpenChange, package: pkg, onSuccess }: DeletePackageDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/packages/${pkg._id}`, {
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
              <DialogTitle className="text-xl font-serif">Delete Package</DialogTitle>
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
            <h4 className="font-semibold mb-1">{pkg.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
            <p className="text-lg font-semibold text-primary">₹{pkg.price}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this package? This will permanently remove it from your salon offerings.
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
                "Delete Package"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
