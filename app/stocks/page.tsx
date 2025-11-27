"use client";

import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react";

export default function StocksPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and adjust stock levels across all products
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Adjust Stock</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Increase or decrease stock quantities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Stock</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Set thresholds for low stock warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Configure Alerts</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Stock Reports</CardTitle>
              </div>
              <CardDescription className="mt-2">
                View detailed stock movement reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Reports</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
              Need to adjust stock quickly?
            </h3>
            <p className="text-lg mb-4 text-muted-foreground">
              Use the Products page to manage individual product stock levels
            </p>
            <Button
              onClick={() => (window.location.href = "/products")}
              variant="default"
            >
              Go to Products →
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
