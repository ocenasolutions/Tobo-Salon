"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, X, Calendar, Plus, Minus, Receipt } from "lucide-react"
import type { PackageType } from "@/lib/models/Package"

interface InventoryItem {
  _id: string
  name: string
  brandName: string
  category: string
  quantity: number
  pricePerUnit: number
}

interface ProductSale {
  inventoryId: string
  productName: string
  brandName: string
  quantitySold: number
  pricePerUnit: number
  totalPrice: number
}

interface Expenditure {
  name: string
  price: number
  description?: string
}

interface CreateBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packages: PackageType[]
  onSuccess: () => void
}

export default function CreateBillDialog({ open, onOpenChange, packages, onSuccess }: CreateBillDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [clientName, setClientName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [upiAmount, setUpiAmount] = useState("")
  const [cardAmount, setCardAmount] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [attendantBy, setAttendantBy] = useState("")

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [productSales, setProductSales] = useState<ProductSale[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [loadingInventory, setLoadingInventory] = useState(false)

  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [expenditureName, setExpenditureName] = useState("")
  const [expenditurePrice, setExpenditurePrice] = useState("")
  const [expenditureDescription, setExpenditureDescription] = useState("")

  useEffect(() => {
    if (open) {
      fetchInventory()
    }
  }, [open])

  const fetchInventory = async () => {
    setLoadingInventory(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const inStockItems = data.inventory.filter((item: InventoryItem) => item.quantity > 0)
        setInventory(inStockItems)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoadingInventory(false)
    }
  }

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

  const filteredInventory = useMemo(() => {
    if (!productSearchQuery.trim()) return inventory

    const query = productSearchQuery.toLowerCase().trim()
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.brandName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    )
  }, [inventory, productSearchQuery])

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId],
    )
  }

  const addProductSale = (item: InventoryItem) => {
    const existingSale = productSales.find((sale) => sale.inventoryId === item._id)
    if (existingSale) {
      updateProductQuantity(item._id, existingSale.quantitySold + 1)
    } else {
      const newSale: ProductSale = {
        inventoryId: item._id,
        productName: item.name,
        brandName: item.brandName,
        quantitySold: 1,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.pricePerUnit,
      }
      setProductSales((prev) => [...prev, newSale])
    }
  }

  const updateProductQuantity = (inventoryId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setProductSales((prev) => prev.filter((sale) => sale.inventoryId !== inventoryId))
      return
    }

    const item = inventory.find((item) => item._id === inventoryId)
    if (!item || newQuantity > item.quantity) return

    setProductSales((prev) =>
      prev.map((sale) =>
        sale.inventoryId === inventoryId
          ? { ...sale, quantitySold: newQuantity, totalPrice: newQuantity * sale.pricePerUnit }
          : sale,
      ),
    )
  }

  const removeProductSale = (inventoryId: string) => {
    setProductSales((prev) => prev.filter((sale) => sale.inventoryId !== inventoryId))
  }

  const calculateServicesTotal = () => {
    return packages
      .filter((pkg) => selectedPackages.includes(pkg._id!.toString()))
      .reduce((sum, pkg) => sum + pkg.price, 0)
  }

  const calculateProductSalesTotal = () => {
    return productSales.reduce((sum, sale) => sum + sale.totalPrice, 0)
  }

  const addExpenditure = () => {
    if (!expenditureName.trim() || !expenditurePrice.trim()) return

    const newExpenditure: Expenditure = {
      name: expenditureName.trim(),
      price: Number.parseFloat(expenditurePrice),
      description: expenditureDescription.trim() || undefined,
    }

    setExpenditures((prev) => [...prev, newExpenditure])
    setExpenditureName("")
    setExpenditurePrice("")
    setExpenditureDescription("")
  }

  const removeExpenditure = (index: number) => {
    setExpenditures((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateExpendituresTotal = () => {
    return expenditures.reduce((sum, exp) => sum + exp.price, 0)
  }

  const calculateGrandTotal = () => {
    const servicesTotal = calculateServicesTotal()
    const productSalesTotal = calculateProductSalesTotal()
    const expendituresTotal = calculateExpendituresTotal()
    return servicesTotal + productSalesTotal + expendituresTotal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedPackages.length === 0) {
      setError("Please select at least one service")
      return
    }

    if (!clientName.trim()) {
      setError("Please enter client name")
      return
    }

    if (!attendantBy.trim()) {
      setError("Please enter attendant name")
      return
    }

    const upi = Number.parseFloat(upiAmount) || 0
    const card = Number.parseFloat(cardAmount) || 0
    const cash = Number.parseFloat(cashAmount) || 0

    const totalPayment = upi + card + cash
    const expectedPayment = calculateServicesTotal()

    if (Math.abs(totalPayment - expectedPayment) > 0.01) {
      setError(`Payment total (₹${totalPayment.toFixed(2)}) must equal services total (₹${expectedPayment.toFixed(2)})`)
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
          clientName: clientName.trim(),
          customerMobile: customerMobile.trim() || undefined,
          upiAmount: upi,
          cardAmount: card,
          cashAmount: cash,
          attendantBy: attendantBy.trim(),
          productSales: productSales,
          expenditures: expenditures,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setSelectedPackages([])
      setSearchQuery("")
      setClientName("")
      setCustomerMobile("")
      setUpiAmount("")
      setCardAmount("")
      setCashAmount("")
      setAttendantBy("")
      setProductSales([])
      setProductSearchQuery("")
      setExpenditures([])
      setExpenditureName("")
      setExpenditurePrice("")
      setExpenditureDescription("")
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

  const clearProductSearch = () => {
    setProductSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center space-y-2 border-b pb-4">
            <DialogTitle className="text-3xl font-serif">Daily Sheet</DialogTitle>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Salon: HUSN Beauty</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-base font-semibold">
                Client Name *
              </Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerMobile" className="text-base font-semibold">
                Customer Mobile (WhatsApp)
              </Label>
              <Input
                id="customerMobile"
                type="tel"
                placeholder="+91XXXXXXXXXX (optional)"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Optional: Include country code for WhatsApp notifications</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendantBy" className="text-base font-semibold">
                Attendant By *
              </Label>
              <Input
                id="attendantBy"
                type="text"
                placeholder="Enter attendant name"
                value={attendantBy}
                onChange={(e) => setAttendantBy(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Services:</Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search services by name, description, or type..."
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
            </div>

            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {filteredPackages.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No services match your search</p>
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

          <div className="space-y-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-800">Product Sales</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Available Products (In Stock):</Label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products by name, brand, or category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading || loadingInventory}
                />
                {productSearchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearProductSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {loadingInventory ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-48 overflow-y-auto">
                {filteredInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {productSearchQuery ? "No products match your search" : "No products in stock"}
                    </p>
                    {productSearchQuery && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearProductSearch}
                        className="mt-2 bg-transparent"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const existingSale = productSales.find((sale) => sale.inventoryId === item._id)
                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300"
                            >
                              {item.brandName}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Stock: {item.quantity} | ₹{item.pricePerUnit.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {existingSale ? (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(item._id, existingSale.quantitySold - 1)}
                                className="h-8 w-8 p-0"
                                disabled={loading}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{existingSale.quantitySold}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(item._id, existingSale.quantitySold + 1)}
                                className="h-8 w-8 p-0"
                                disabled={loading || existingSale.quantitySold >= item.quantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductSale(item._id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addProductSale(item)}
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Selected Products Summary */}
            {productSales.length > 0 && (
              <div className="border-t border-emerald-200 pt-4">
                <h4 className="font-medium mb-2">Selected Products:</h4>
                <div className="space-y-2">
                  {productSales.map((sale) => (
                    <div key={sale.inventoryId} className="flex justify-between items-center text-sm">
                      <span>
                        {sale.productName} ({sale.brandName}) × {sale.quantitySold}
                      </span>
                      <span className="font-medium">₹{sale.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 bg-orange-50/50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Expenditures</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenditureName" className="text-sm font-medium">
                  Expense Name *
                </Label>
                <Input
                  id="expenditureName"
                  type="text"
                  placeholder="e.g., Transportation, Utilities"
                  value={expenditureName}
                  onChange={(e) => setExpenditureName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenditurePrice" className="text-sm font-medium">
                  Amount *
                </Label>
                <Input
                  id="expenditurePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={expenditurePrice}
                  onChange={(e) => setExpenditurePrice(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenditureDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="expenditureDescription"
                  type="text"
                  placeholder="Optional details"
                  value={expenditureDescription}
                  onChange={(e) => setExpenditureDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium opacity-0">Add</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExpenditure}
                  disabled={loading || !expenditureName.trim() || !expenditurePrice.trim()}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </div>

            {expenditures.length > 0 && (
              <div className="border-t border-orange-200 pt-4">
                <h4 className="font-medium mb-2">Added Expenditures:</h4>
                <div className="space-y-2">
                  {expenditures.map((exp, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-orange-100 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{exp.name}</div>
                        {exp.description && <div className="text-sm text-muted-foreground">{exp.description}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₹{exp.price.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpenditure(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-orange-300">
                  <span className="font-medium">Total Expenditures:</span>
                  <span className="font-semibold text-orange-700">₹{calculateExpendituresTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold">Payment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upiAmount" className="text-sm font-medium">
                  UPI Amount
                </Label>
                <Input
                  id="upiAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardAmount" className="text-sm font-medium">
                  Card Amount
                </Label>
                <Input
                  id="cardAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashAmount" className="text-sm font-medium">
                  Cash Amount
                </Label>
                <Input
                  id="cashAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Services Total:</span>
                <span className="font-medium">₹{calculateServicesTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product Sales:</span>
                <span className="font-medium">₹{calculateProductSalesTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expenditures:</span>
                <span className="font-medium text-orange-600">₹{calculateExpendituresTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Grand Total:</span>
                <span className="text-primary">₹{calculateGrandTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Payment Total:</span>
                <span>
                  ₹
                  {(
                    (Number.parseFloat(upiAmount) || 0) +
                    (Number.parseFloat(cardAmount) || 0) +
                    (Number.parseFloat(cashAmount) || 0)
                  ).toFixed(2)}
                </span>
              </div>
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
            <Button
              type="submit"
              disabled={loading || selectedPackages.length === 0 || !clientName.trim() || !attendantBy.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Entry...
                </>
              ) : (
                "Add to Daily Sheet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
