"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Search, X, Minus } from "lucide-react"
import type { Bill } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"

interface EditBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill
  packages: Package[]
  onSuccess: () => void
}

interface ProductSale {
  name: string
  price: number
  quantity: number
}

interface Expenditure {
  name: string
  amount: number
  description: string
}

interface InventoryItem {
  _id: string
  name: string
  brandName: string
  category: string
  quantity: number
  pricePerUnit: number
}

interface InventoryProductSale {
  inventoryId: string
  productName: string
  brandName: string
  quantitySold: number
  pricePerUnit: number
  totalPrice: number
}

export default function EditBillDialog({ open, onOpenChange, bill, packages, onSuccess }: EditBillDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [clientName, setClientName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [attendantBy, setAttendantBy] = useState("")
  const [productSales, setProductSales] = useState<ProductSale[]>([])
  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "CASH">("CASH")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryProductSales, setInventoryProductSales] = useState<InventoryProductSale[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [loadingInventory, setLoadingInventory] = useState(false)

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

  useEffect(() => {
    if (bill) {
      console.log("[v0] Loading bill data:", bill)
      setSelectedPackages(bill.items.map((item) => item.packageId.toString()))
      setClientName(bill.clientName || "")
      setCustomerMobile(bill.customerMobile || "")
      setAttendantBy(bill.attendantBy || "")

      const loadedProductSales = (bill.productSales || []).map((product) => ({
        name: product.name || "",
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 1,
      }))
      console.log("[v0] Loaded product sales:", loadedProductSales)
      setProductSales(loadedProductSales)

      const loadedExpenditures = (bill.expenditures || []).map((expense) => ({
        name: expense.name || "",
        amount: Number(expense.amount) || 0,
        description: expense.description || "",
      }))
      console.log("[v0] Loaded expenditures:", loadedExpenditures)
      setExpenditures(loadedExpenditures)

      if (bill.upiAmount > 0) setPaymentMethod("UPI")
      else if (bill.cardAmount > 0) setPaymentMethod("CARD")
      else setPaymentMethod("CASH")
    }
  }, [bill])

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId],
    )
  }

  const addProductSale = () => {
    setProductSales([...productSales, { name: "", price: 0, quantity: 1 }])
  }

  const updateProductSale = (index: number, field: keyof ProductSale, value: string | number) => {
    const updated = [...productSales]
    updated[index] = { ...updated[index], [field]: value }
    setProductSales(updated)
  }

  const removeProductSale = (index: number) => {
    setProductSales(productSales.filter((_, i) => i !== index))
  }

  const addInventoryProductSale = (item: InventoryItem) => {
    const existingSale = inventoryProductSales.find((sale) => sale.inventoryId === item._id)
    if (existingSale) {
      updateInventoryProductQuantity(item._id, existingSale.quantitySold + 1)
    } else {
      const newSale: InventoryProductSale = {
        inventoryId: item._id,
        productName: item.name,
        brandName: item.brandName,
        quantitySold: 1,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.pricePerUnit,
      }
      setInventoryProductSales((prev) => [...prev, newSale])
    }
  }

  const updateInventoryProductQuantity = (inventoryId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setInventoryProductSales((prev) => prev.filter((sale) => sale.inventoryId !== inventoryId))
      return
    }

    const item = inventory.find((item) => item._id === inventoryId)
    if (!item || newQuantity > item.quantity) return

    setInventoryProductSales((prev) =>
      prev.map((sale) =>
        sale.inventoryId === inventoryId
          ? { ...sale, quantitySold: newQuantity, totalPrice: newQuantity * sale.pricePerUnit }
          : sale,
      ),
    )
  }

  const removeInventoryProductSale = (inventoryId: string) => {
    setInventoryProductSales((prev) => prev.filter((sale) => sale.inventoryId !== inventoryId))
  }

  const addExpenditure = () => {
    setExpenditures([...expenditures, { name: "", amount: 0, description: "" }])
  }

  const updateExpenditure = (index: number, field: keyof Expenditure, value: string | number) => {
    const updated = [...expenditures]
    updated[index] = { ...updated[index], [field]: value }
    setExpenditures(updated)
  }

  const removeExpenditure = (index: number) => {
    setExpenditures(expenditures.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    const servicesTotal = packages
      .filter((pkg) => selectedPackages.includes(pkg._id!.toString()))
      .reduce((sum, pkg) => sum + pkg.price, 0)

    const productSalesTotal = productSales.reduce((sum, product) => {
      const price = Number(product.price) || 0
      const quantity = Number(product.quantity) || 0
      return sum + price * quantity
    }, 0)

    const inventoryProductSalesTotal = inventoryProductSales.reduce((sum, sale) => sum + sale.totalPrice, 0)

    const expendituresTotal = expenditures.reduce((sum, exp) => {
      const amount = Number(exp.amount) || 0
      return sum + amount
    }, 0)

    const total = servicesTotal + productSalesTotal + inventoryProductSalesTotal + expendituresTotal
    console.log("[v0] Calculating total:", {
      servicesTotal,
      productSalesTotal,
      inventoryProductSalesTotal,
      expendituresTotal,
      total,
    })
    return total
  }

  const clearProductSearch = () => {
    setProductSearchQuery("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedPackages.length === 0) {
      setError("Please select at least one package")
      return
    }

    if (!attendantBy.trim()) {
      setError("Attendant name is required")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth-token")

      const allProductSales = [
        ...productSales,
        ...inventoryProductSales.map((sale) => ({
          name: `${sale.productName} (${sale.brandName})`,
          price: sale.pricePerUnit,
          quantity: sale.quantitySold,
        })),
      ]

      const response = await fetch(`/api/bills/${bill._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageIds: selectedPackages,
          clientName: clientName.trim() || "Walk-in Customer",
          customerMobile: customerMobile.trim(),
          attendantBy: attendantBy.trim(),
          productSales: allProductSales,
          expenditures,
          paymentMethod,
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
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Bill</DialogTitle>
          <DialogDescription>
            Update all details for Bill #{bill._id?.toString().slice(-6).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (Optional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name (optional)"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerMobile">Customer Mobile (WhatsApp)</Label>
              <Input
                id="customerMobile"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="+91XXXXXXXXXX (optional)"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendantBy">Attendant By *</Label>
              <Input
                id="attendantBy"
                value={attendantBy}
                onChange={(e) => setAttendantBy(e.target.value)}
                placeholder="Select attendant"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Services:</Label>
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

          <div className="space-y-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-800">Add Products from Inventory</h3>
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
                    const existingSale = inventoryProductSales.find((sale) => sale.inventoryId === item._id)
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
                                onClick={() => updateInventoryProductQuantity(item._id, existingSale.quantitySold - 1)}
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
                                onClick={() => updateInventoryProductQuantity(item._id, existingSale.quantitySold + 1)}
                                className="h-8 w-8 p-0"
                                disabled={loading || existingSale.quantitySold >= item.quantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeInventoryProductSale(item._id)}
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
                              onClick={() => addInventoryProductSale(item)}
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

            {inventoryProductSales.length > 0 && (
              <div className="border-t border-emerald-200 pt-4">
                <h4 className="font-medium mb-2">Selected Inventory Products:</h4>
                <div className="space-y-2">
                  {inventoryProductSales.map((sale) => (
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Manual Product Sales</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProductSale} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            {productSales.map((product, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                <Input
                  placeholder="Product name"
                  value={product.name}
                  onChange={(e) => updateProductSale(index, "name", e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) => updateProductSale(index, "price", Number.parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={(e) => updateProductSale(index, "quantity", Number.parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProductSale(index)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4 p-4 bg-orange-50/50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-orange-800">📋 Expenditures</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExpenditure} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
            {expenditures.map((expense, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-orange-200 rounded-lg bg-white"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Name *</Label>
                  <Input
                    placeholder="e.g., Tea, Coffee, etc."
                    value={expense.name}
                    onChange={(e) => updateExpenditure(index, "name", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Amount *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={expense.amount}
                    onChange={(e) => updateExpenditure(index, "amount", Number.parseFloat(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input
                    placeholder="Optional details"
                    value={expense.description}
                    onChange={(e) => updateExpenditure(index, "description", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExpenditure(index)}
                    disabled={loading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Payment Method</Label>
            <div className="flex gap-2">
              {(["UPI", "CARD", "CASH"] as const).map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={paymentMethod === method ? "default" : "outline"}
                  onClick={() => setPaymentMethod(method)}
                  disabled={loading}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>

          {selectedPackages.length > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Updated Total:</span>
                <span className="text-2xl font-serif font-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Payment via {paymentMethod}</p>
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
