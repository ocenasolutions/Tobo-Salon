"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, X } from "lucide-react"
import type { Package } from "@/lib/models/Package"

interface CreateBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packages: Package[]
  onSuccess: () => void
}

export default function CreateBillDialog({ open, onOpenChange, packages, onSuccess }: CreateBillDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages

    const query = searchQuery.toLowerCase().trim()
    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        pkg.type.toLowerCase().includes(query),
    )
  }, [packages, searchQuery])

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
      const response = await fetch("/api/bills", {
        method: "POST",
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

      // Reset form
      setSelectedPackages([])
      setSearchQuery("")
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Create New Bill</DialogTitle>
          <DialogDescription>Search and select packages to include in this bill</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Packages:</Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search packages by name, description, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""} found
                  {filteredPackages.length === 0 && " - try a different search term"}
                </p>
              )}
            </div>

            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {filteredPackages.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No packages match your search</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="mt-2 bg-transparent"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                filteredPackages.map((pkg) => (
                  <div
                    key={pkg._id?.toString()}
                    className="flex items-center space-x-3 p-3 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={pkg._id?.toString()}
                      checked={selectedPackages.includes(pkg._id!.toString())}
                      onCheckedChange={() => handlePackageToggle(pkg._id!.toString())}
                      disabled={loading}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={pkg._id?.toString()} className="font-medium cursor-pointer">
                          {searchQuery ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pkg.name.replace(
                                  new RegExp(`(${searchQuery})`, "gi"),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
                                ),
                              }}
                            />
                          ) : (
                            pkg.name
                          )}
                        </Label>
                        <Badge variant={pkg.type === "Premium" ? "default" : "secondary"}>{pkg.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {searchQuery ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: pkg.description.replace(
                                new RegExp(`(${searchQuery})`, "gi"),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
                              ),
                            }}
                          />
                        ) : (
                          pkg.description
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary">₹{pkg.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedPackages.length > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Amount:</span>
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
                  Creating Bill...
                </>
              ) : (
                "Create Bill"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
