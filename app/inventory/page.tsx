"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Search, Loader2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  _id: string
  name: string
  brandName: string
  expiryDate?: string
  quantity: number
  pricePerUnit: number
  total: number
  paymentStatus: "Paid" | "Unpaid"
  dateEntered: string
  createdAt?: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    expiryDate: "",
    quantity: "",
    pricePerUnit: "",
    paymentStatus: "Unpaid" as "Paid" | "Unpaid",
  })

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) throw new Error("Failed to fetch inventory")

      const data = await response.json()
      setItems(
        data.inventory.map((item: any) => ({
          ...item,
          _id: item._id,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : undefined,
          dateEntered: new Date(item.dateEntered).toISOString().split("T")[0],
        })),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createInventoryItem = async (itemData: any) => {
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create item")
    }

    return response.json()
  }

  const updateInventoryItem = async (id: string, itemData: any) => {
    const response = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update item")
    }

    return response.json()
  }

  const deleteInventoryItem = async (id: string) => {
    const response = await fetch(`/api/inventory/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete item")
    }

    return response.json()
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.brandName || !formData.quantity || !formData.pricePerUnit) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const itemData = {
        name: formData.name,
        brandName: formData.brandName,
        expiryDate: formData.expiryDate || null,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
        paymentStatus: formData.paymentStatus,
      }

      if (editingItem) {
        await updateInventoryItem(editingItem, itemData)
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        await createInventoryItem(itemData)
        toast({
          title: "Success",
          description: "Product added successfully",
        })
      }

      await fetchInventory()

      setFormData({
        name: "",
        brandName: "",
        expiryDate: "",
        quantity: "",
        pricePerUnit: "",
        paymentStatus: "Unpaid",
      })
      setIsAddingItem(false)
      setEditingItem(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      brandName: item.brandName,
      expiryDate: item.expiryDate || "",
      quantity: item.quantity.toString(),
      pricePerUnit: item.pricePerUnit.toString(),
      paymentStatus: item.paymentStatus,
    })
    setEditingItem(item._id)
    setIsAddingItem(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await deleteInventoryItem(id)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      await fetchInventory()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = items.reduce((sum, item) => sum + item.total, 0)
  const paidValue = items.filter((item) => item.paymentStatus === "Paid").reduce((sum, item) => sum + item.total, 0)
  const unpaidValue = totalValue - paidValue

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading inventory...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{paidValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{unpaidValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {isAddingItem && (
          <Card>
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Product" : "Add New Product"}</CardTitle>
              <CardDescription>Enter the details of the product you bought</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="Brand name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price Per Unit *</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      placeholder="Enter price per unit"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      value={
                        formData.quantity && formData.pricePerUnit
                          ? (Number(formData.quantity) * Number(formData.pricePerUnit)).toFixed(2)
                          : "0.00"
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: "Paid" | "Unpaid") => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? "Update Product" : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingItem(false)
                      setEditingItem(null)
                      setFormData({
                        name: "",
                        brandName: "",
                        expiryDate: "",
                        quantity: "",
                        pricePerUnit: "",
                        paymentStatus: "Unpaid",
                      })
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddingItem(true)} disabled={isAddingItem || isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No products found matching your search."
                    : "No products added yet. Click 'Add Product' to get started."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200"
                        >
                          {item.brandName}
                        </Badge>
                        <Badge variant={item.paymentStatus === "Paid" ? "default" : "destructive"}>
                          {item.paymentStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Brand:</span> {item.brandName}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Price/Unit:</span> ₹{item.pricePerUnit.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ₹{item.total.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Added:</span> {item.dateEntered}
                        </div>
                        {item.expiryDate && (
                          <div className="col-span-2">
                            <span className="font-medium">Expires:</span> {item.expiryDate}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
