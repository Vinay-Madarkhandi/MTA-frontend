"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { orderApi } from "@/lib/api/orders";
import { Order } from "@/types";
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
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status.toUpperCase() === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status.toUpperCase() === "PENDING").length,
    paid: orders.filter((o) => o.status.toUpperCase() === "PAID").length,
    cancelled: orders.filter((o) => o.status.toUpperCase() === "CANCELLED")
      .length,
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    const colors = {
      PAID: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      colors[statusUpper as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage all your orders
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.paid}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cancelled
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.cancelled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Orders cancelled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              {["ALL", "PENDING", "PAID", "CANCELLED"].map((status) => (
                <Button
                  key={status}
                  onClick={() => setFilter(status)}
                  variant={filter === status ? "default" : "outline"}
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
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
                  <TableHead className="text-muted-foreground">Total</TableHead>
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
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No {filter !== "ALL" ? filter.toLowerCase() : ""} orders
                      found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
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
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
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
