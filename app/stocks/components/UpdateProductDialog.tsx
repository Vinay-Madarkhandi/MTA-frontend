"use client";

/**
 * Update Product Dialog Component
 * Form for updating existing products
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types";
import { Category } from "@/lib/api/categories";

interface UpdateProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onSave: (data: any) => Promise<void>;
  categories: Category[];
}

export function UpdateProductDialog({ open, onClose, product, onSave, categories }: UpdateProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    currentStock: 0,
    sku: "",
    unit: "kg",
    supplier: "",
    imageUrl: "",
    active: true,
    lowStockThreshold: 10,
    minimumQuantity: 5,
    expiryDate: "",
    batchNumber: "",
    manufacturingDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand || "",
        description: product.description || "",
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        currentStock: product.currentStock || product.stock,
        sku: product.sku,
        unit: product.unit,
        supplier: product.supplier || "",
        imageUrl: product.imageUrl || "",
        active: product.active,
        lowStockThreshold: product.lowStockThreshold || 10,
        minimumQuantity: product.minimumQuantity || 5,
        expiryDate: product.expiryDate || "",
        batchNumber: product.batchNumber || "",
        manufacturingDate: product.manufacturingDate || "",
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.sku.trim()) {
      alert("Please fill in required fields (Name and SKU)");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        stock: formData.stock, // Backend expects 'stock', not 'currentStock'
      });
    } catch (error) {
      // Error already handled in parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Enter brand..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Purchase Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice || ""}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Selling Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.sellingPrice || ""}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stock || ""}
                onChange={(e) => {
                  const stock = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, stock, currentStock: stock });
                }}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="l">Liter (l)</SelectItem>
                  <SelectItem value="ml">Milliliter (ml)</SelectItem>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={formData.lowStockThreshold || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })
                }
                placeholder="10"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Minimum Quantity</Label>
              <Input
                type="number"
                value={formData.minimumQuantity || ""}
                onChange={(e) =>
                  setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 5 })
                }
                placeholder="5"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Enter supplier name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Batch Number</Label>
              <Input
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="Enter batch number..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Manufacturing Date</Label>
              <Input
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
