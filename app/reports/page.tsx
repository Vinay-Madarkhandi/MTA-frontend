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
import {
  BarChart3,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  RefreshCw,
  LineChart,
} from "lucide-react";

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Get insights into your business performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Sales Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Daily, weekly, and monthly sales analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Inventory Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Stock levels and product performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Low Stock Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Products running low on inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Revenue Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Profit margins and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Customer Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Top customers and buying patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Stock Movement</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Track inventory in and out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <LineChart className="h-6 w-6" />
              Advanced Analytics Coming Soon!
            </h3>
            <p className="text-muted-foreground">
              We're working on detailed charts, graphs, and exportable reports
              to help you make better business decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
