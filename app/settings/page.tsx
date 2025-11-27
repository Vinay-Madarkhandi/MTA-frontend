"use client";

import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Lock, Bell, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 99999 88888"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">हिंदी</SelectItem>
                        <SelectItem value="marathi">मराठी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input id="confirm" type="password" />
                  </div>
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                (
                {[
                  {
                    label: "Low stock alerts",
                    desc: "Get notified when products run low",
                  },
                  {
                    label: "New orders",
                    desc: "Notifications for new customer orders",
                  },
                  {
                    label: "Daily reports",
                    desc: "Receive end-of-day summary reports",
                  },
                  {
                    label: "Marketing updates",
                    desc: "Product updates and new features",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>
                  Customize your application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="inr">
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="ddmmyyyy">
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
