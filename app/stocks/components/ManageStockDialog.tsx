"use client";

/**
 * Manage Stock Dialog Component
 * Search interface to find and update stock for products
 * Matches the design reference image
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import { productApi } from "@/lib/api/products";
import { useProducts } from "@/hooks/useProducts";
import { Loader2, Search, Package, X } from "lucide-react";

interface ManageStockDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onStockUpdated: () => Promise<void>;
}

export function ManageStockDialog({ open, onClose, product: initialProduct, onStockUpdated }: ManageStockDialogProps) {
  const { products, fetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [addStock, setAddStock] = useState(0);
  const [reduceStock, setReduceStock] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      if (initialProduct) {
        setSelectedProduct(initialProduct);
        setSearchQuery(initialProduct.name);
      } else {
        setSelectedProduct(null);
        setSearchQuery("");
      }
      setAddStock(0);
      setReduceStock(0);
    }
  }, [open, initialProduct]);

  const filteredProducts = products.filter(
    (p) => {
      const query = searchQuery.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    if (addStock === 0 && reduceStock === 0) {
      alert("Please enter stock to add or reduce");
      return;
    }

    setIsUpdating(true);
    try {
      await productApi.adjustStock(selectedProduct.id, {
        addStock,
        reduceStock,
      });
      await onStockUpdated();
      setAddStock(0);
      setReduceStock(0);
      setSelectedProduct(null);
      setSearchQuery("");
    } catch (error: any) {
      console.error("Failed to update stock:", error);
      alert(`Failed to update stock: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const newStock = selectedProduct ? selectedProduct.stock + addStock - reduceStock : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Package className="h-5 w-5" />
            Manage Stock
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Search Section */}
          <div>
            <Label className="text-gray-900 dark:text-white">Search Product</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or category..."
                className="pl-10 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedProduct(null);
                  }}
                  className="absolute right-3 top-3"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && filteredProducts.length > 0 && !selectedProduct && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg max-h-48 overflow-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer border-b border-gray-200 dark:border-zinc-800 last:border-b-0"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-xs text-gray-400">
                      SKU: {product.sku} | Category: {product.category} | Stock: {product.stock} {product.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct ? (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
              <div>
                <div className="text-sm text-gray-400">Product</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</div>
                <div className="text-sm text-gray-400">
                  SKU: {selectedProduct.sku} | Category: {selectedProduct.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Current Stock</Label>
                  <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {selectedProduct.stock} pcs
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">New Stock (Preview)</Label>
                  <div className={`text-2xl font-bold mt-1 ${newStock < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {newStock} pcs
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Add Stock</Label>
                  <Input
                    type="number"
                    value={addStock || ""}
                    onChange={(e) => setAddStock(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Reduce Stock</Label>
                  <Input
                    type="number"
                    value={reduceStock || ""}
                    onChange={(e) => setReduceStock(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              {newStock < 0 && (
                <div className="text-sm text-red-500">
                  Warning: Stock cannot be negative
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900">
              {searchQuery ? "No products found. Try a different search." : "No products available"}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isUpdating}
            className="bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || !selectedProduct || newStock < 0}
            className="bg-white text-black hover:bg-gray-200"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Stock"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
