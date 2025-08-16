"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, PackageIcon, Edit, Trash2, Search, Filter } from "lucide-react"
import type { Package } from "@/lib/models/Package"
import CreatePackageDialog from "@/components/packages/create-package-dialog"
import EditPackageDialog from "@/components/packages/edit-package-dialog"
import DeletePackageDialog from "@/components/packages/delete-package-dialog"
import DashboardLayout from "@/components/dashboard-layout"

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")

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
    fetchPackages()
  }, [])

  const handlePackageCreated = () => {
    fetchPackages()
    setShowCreateDialog(false)
  }

  const handlePackageUpdated = () => {
    fetchPackages()
    setEditingPackage(null)
  }

  const handlePackageDeleted = () => {
    fetchPackages()
    setDeletingPackage(null)
  }

  const filteredAndSortedPackages = useMemo(() => {
    const filtered = packages.filter((pkg) => {
      // Search by name
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by type
      const matchesType = typeFilter === "all" || pkg.type.toLowerCase() === typeFilter.toLowerCase()

      // Filter by price range
      let matchesPrice = true
      if (priceFilter === "under50") {
        matchesPrice = pkg.price < 50
      } else if (priceFilter === "50to100") {
        matchesPrice = pkg.price >= 50 && pkg.price <= 100
      } else if (priceFilter === "over100") {
        matchesPrice = pkg.price > 100
      }

      return matchesSearch && matchesType && matchesPrice
    })

    // Sort packages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "date-new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-old":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [packages, searchTerm, priceFilter, typeFilter, sortBy])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading packages...</p>
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
            <p className="text-muted-foreground">Manage your salon service offerings</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2 self-start sm:self-auto">
            <Plus className="h-5 w-5" />
            Create Package
          </Button>
        </div>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under50">Under ₹50</SelectItem>
                  <SelectItem value="50to100">₹50 - ₹100</SelectItem>
                  <SelectItem value="over100">Over ₹100</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="date-new">Newest First</SelectItem>
                  <SelectItem value="date-old">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setPriceFilter("all")
                  setTypeFilter("all")
                  setSortBy("name")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedPackages.length} of {packages.length} packages
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        {filteredAndSortedPackages.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PackageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2">
                {packages.length === 0 ? "No packages yet" : "No packages match your filters"}
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {packages.length === 0
                  ? "Create your first service package to start managing your salon offerings"
                  : "Try adjusting your search terms or filters to find packages"}
              </p>
              {packages.length === 0 ? (
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Package
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setPriceFilter("all")
                    setTypeFilter("all")
                    setSortBy("name")
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPackages.map((pkg) => (
              <Card key={pkg._id?.toString()} className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-serif mb-2">{pkg.name}</CardTitle>
                      <Badge variant={pkg.type === "Premium" ? "default" : "secondary"} className="mb-2">
                        {pkg.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPackage(pkg)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPackage(pkg)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 leading-relaxed">{pkg.description}</CardDescription>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-3xl font-serif font-bold text-primary">₹{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreatePackageDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handlePackageCreated}
      />

      {editingPackage && (
        <EditPackageDialog
          open={!!editingPackage}
          onOpenChange={() => setEditingPackage(null)}
          package={editingPackage}
          onSuccess={handlePackageUpdated}
        />
      )}

      {deletingPackage && (
        <DeletePackageDialog
          open={!!deletingPackage}
          onOpenChange={() => setDeletingPackage(null)}
          package={deletingPackage}
          onSuccess={handlePackageDeleted}
        />
      )}
    </DashboardLayout>
  )
}
