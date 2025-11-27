"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { productApi } from "@/lib/api/products";
import { Product, InventorySummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Grains",
    brand: "",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    sku: "",
    unit: "kg",
    supplier: "",
    imageUrl: "",
    active: true,
    lowStockThreshold: 10,
    minimumQuantity: 5,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, summaryData] = await Promise.all([
        productApi.getAll(),
        productApi.getSummary(),
      ]);
      setProducts(productsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.create(formData);
      setShowAddForm(false);
      setFormData({
        name: "",
        category: "Grains",
        brand: "",
        purchasePrice: 0,
        sellingPrice: 0,
        stock: 0,
        sku: "",
        unit: "kg",
        supplier: "",
        imageUrl: "",
        active: true,
        lowStockThreshold: 10,
        minimumQuantity: 5,
      });
      loadData();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productApi.delete(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const getStatusBadge = (product: Product) => {
    const { stock, lowStockThreshold, minimumQuantity } = product;
    const threshold = lowStockThreshold || minimumQuantity || 0;

    if (stock === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
        >
          Out of Stock
        </Badge>
      );
    }
    if (stock <= threshold) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
        >
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      >
        In Stock
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Everything you need to manage products, stock, suppliers and
            reporting in one place.
          </p>
        </header>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.totalProducts}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.inStock}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.lowStock}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.outOfStock}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Inventory
            </Button>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
          <p className="text-muted-foreground">
            Showing {products.length} products
          </p>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grains">Grains</SelectItem>
                      <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Seeds">Seeds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand / Company</Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Brand / Company"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="Purchase Price"
                    value={formData.purchasePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: Number(e.target.value),
                      })
                    }
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    placeholder="Selling Price"
                    value={formData.sellingPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellingPrice: Number(e.target.value),
                      })
                    }
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Product Code</Label>
                  <Input
                    id="sku"
                    type="text"
                    placeholder="SKU / Product Code"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    type="text"
                    placeholder="Unit (kg, pcs, box)"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier Name</Label>
                  <Input
                    id="supplier"
                    type="text"
                    placeholder="Supplier Name"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="text"
                    placeholder="Image URL"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <Button type="submit" className="flex-1">
                    Create Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Product
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Stock</TableHead>
                  <TableHead className="text-muted-foreground">Value</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No products yet. Click "Add Product" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{product.sellingPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{(product.sellingPrice * product.stock).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
