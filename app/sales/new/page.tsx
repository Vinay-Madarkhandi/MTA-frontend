"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { orderApi } from "@/lib/api/orders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    customer: "",
    items: 1,
    total: 0,
    status: "PENDING",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await orderApi.create(formData);
      alert("Sale created successfully!");
      router.push("/sales");
    } catch (error) {
      console.error("Failed to create sale:", error);
      alert("Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
              New Sale
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Capture the complete transaction before recording it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orderId">Sale Reference</Label>
                <Input
                  id="orderId"
                  type="text"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: System will generate if left empty
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name *</Label>
                <Input
                  id="customer"
                  type="text"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  placeholder="Customer or shop name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="items">Items Sold *</Label>
                  <Input
                    id="items"
                    type="number"
                    min="1"
                    value={formData.items}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        items: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 4"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount *</Label>
                  <Input
                    id="total"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.total || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total: Number(e.target.value),
                      })
                    }
                    placeholder="₹ 0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Sale"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/sales")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
