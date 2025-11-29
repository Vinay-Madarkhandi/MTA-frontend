"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { customerApi } from "@/lib/api/customers";
import { customerOrderApi } from "@/lib/api/customer-orders";
import { Customer, CustomerCommand, CustomerOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Edit,
  Trash2,
  X,
  Eye,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    repeatCustomers: 0,
  });

  const [formData, setFormData] = useState<CustomerCommand>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, statsData] = await Promise.all([
        customerApi.getAll(),
        customerApi.getStats(),
      ]);
      setCustomers(customersData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerSearch) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(lowerSearch))
    );
    setFilteredCustomers(filtered);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please fill in required fields (Name and Phone)");
      return;
    }

    try {
      await customerApi.create(formData);
      setShowAddModal(false);
      setFormData({ name: "", phone: "", email: "", address: "" });
      loadData();
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert("Failed to add customer");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      await customerApi.update(selectedCustomer.id, formData);
      setShowEditModal(false);
      setSelectedCustomer(null);
      setFormData({ name: "", phone: "", email: "", address: "" });
      loadData();
      alert("Customer updated successfully!");
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await customerApi.delete(id);
      loadData();
      alert("Customer deleted successfully!");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer");
    }
  };

  const viewPurchaseHistory = async (customer: Customer) => {
    try {
      setSelectedCustomer(customer);
      setShowHistoryModal(true);
      const orders = await customerOrderApi.getByCustomerId(customer.id);
      setCustomerOrders(orders);
    } catch (error) {
      console.error("Failed to load purchase history:", error);
      alert("Failed to load purchase history");
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customers and view their purchase history
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.newCustomersThisMonth}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Repeat Customers
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.repeatCustomers}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                  <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Purchase</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mt-2">
                          {searchTerm
                            ? "No customers found"
                            : "No customers yet"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            {customer.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                          {customer.address && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address.substring(0, 30)}
                              {customer.address.length > 30 && "..."}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {customer.totalPurchases}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {customer.totalSpent.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.lastPurchaseDate ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {format(
                                  new Date(customer.lastPurchaseDate),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs mt-1">
                                {format(
                                  new Date(customer.lastPurchaseDate),
                                  "hh:mm a"
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No purchases
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewPurchaseHistory(customer)}
                              title="View Purchase History"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(customer)}
                              title="Edit Customer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
            >
              <Card className="h-full md:h-auto overflow-y-auto">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add New Customer
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter customer name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="customer@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address (Optional)</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Enter customer address"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCustomer(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
            >
              <Card className="h-full md:h-auto overflow-y-auto">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Edit Customer
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedCustomer(null);
                      }}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleEdit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter customer name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email (Optional)</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="customer@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-address">Address (Optional)</Label>
                      <Textarea
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Enter customer address"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Customer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedCustomer(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Purchase History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => {
                setShowHistoryModal(false);
                setSelectedCustomer(null);
                setCustomerOrders([]);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 z-50"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Purchase History
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCustomer.name} - {selectedCustomer.phone}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowHistoryModal(false);
                        setSelectedCustomer(null);
                        setCustomerOrders([]);
                      }}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  {/* Customer Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedCustomer.totalPurchases}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold flex items-center text-green-600">
                          <IndianRupee className="h-5 w-5" />
                          {selectedCustomer.totalSpent.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Avg Order Value
                        </p>
                        <p className="text-2xl font-bold flex items-center">
                          <IndianRupee className="h-5 w-5" />
                          {selectedCustomer.totalPurchases > 0
                            ? (
                                selectedCustomer.totalSpent /
                                selectedCustomer.totalPurchases
                              ).toFixed(2)
                            : "0.00"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Order History</h3>
                    {customerOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mt-2">
                          No orders found
                        </p>
                      </div>
                    ) : (
                      customerOrders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{order.orderId}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(
                                    new Date(order.orderDate),
                                    "MMM dd, yyyy 'at' hh:mm a"
                                  )}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  order.paymentStatus === "PAID"
                                    ? "default"
                                    : order.paymentStatus === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                            </div>

                            {/* Order Items */}
                            <div className="border-t pt-3 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-sm"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {item.productName}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {item.quantity} × ₹
                                      {item.unitPrice.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-semibold">
                                    ₹{item.totalPrice.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Order Total */}
                            <div className="border-t mt-3 pt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Subtotal:</span>
                                <span>₹{order.subtotal.toFixed(2)}</span>
                              </div>
                              {order.tax > 0 && (
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Tax:</span>
                                  <span>₹{order.tax.toFixed(2)}</span>
                                </div>
                              )}
                              {order.discount > 0 && (
                                <div className="flex justify-between text-sm mb-1 text-green-600">
                                  <span>Discount:</span>
                                  <span>-₹{order.discount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                <span>Total:</span>
                                <span className="flex items-center">
                                  <IndianRupee className="h-4 w-4" />
                                  {order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-3 pt-3 border-t">
                              <Badge variant="outline">
                                {order.paymentMethod}
                              </Badge>
                              {order.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Note: {order.notes}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
