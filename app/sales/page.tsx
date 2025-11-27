"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { orderApi } from "@/lib/api/orders";
import { Order, DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SalesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        orderApi.getAll(),
        orderApi.getTodaysStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">
              Manage all your sales transactions
            </p>
          </div>
          <Button onClick={() => router.push("/sales/new")}>+ New Sale</Button>
        </div>

        {/* Sales Overview */}
        {stats && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Sales Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Today's Sales
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">₹</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{stats.totalSales}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total revenue today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Paid Orders
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">✓</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.paidCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">○</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.pendingCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cancelled
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">✕</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.cancelledCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders cancelled
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Order ID
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="text-muted-foreground">Items</TableHead>
                  <TableHead className="text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No sales yet. Click "New Sale" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {order.customer}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {order.items}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ₹{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
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
