"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useGetUserOrdersQuery } from "@/lib/features/orders/ordersApi";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  X,
  Menu,
  Loader2,
} from "lucide-react";

// Helper function to format order data
const formatOrderData = (order: any) => {
  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber || `ORD-${order._id?.slice(-6)}`,
    date: order.createdAt || order.date,
    status: order.status || order.currentStatus || 'pending',
    total: order.totalPrice || order.total || 0,
    items: order.products || order.productID || [],
    paymentMethod: order.paymentMethod || 'credit_card',
    paymentStatus: order.paymentStatus || false,
    trackingSteps: order.trackingSteps || [],
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    notes: order.notes,
    quantity: order.quantity || 1,
  };
};

const mockWishlist = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    price: 399.99,
    image: "/wireless-headphones.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 249.99,
    image: "/smartwatch-lifestyle.png",
    inStock: false,
  },
  {
    id: 3,
    name: "Ergonomic Laptop Stand",
    price: 129.99,
    image: "/laptop-stand.png",
    inStock: true,
  },
];

const mockAddresses = [
  {
    id: 1,
    type: "Home",
    name: "John Doe",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    isDefault: true,
  },
  {
    id: 2,
    type: "Work",
    name: "John Doe",
    address: "456 Business Ave",
    city: "New York",
    state: "NY",
    zip: "10002",
    isDefault: false,
  },
];

const mockPaymentMethods = [
  {
    id: 1,
    type: "Visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "8888",
    expiry: "09/25",
    isDefault: false,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "processing":
      return <Clock className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const navigationItems = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  //   { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export function AccountDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get user from Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Fetch user orders
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useGetUserOrdersQuery({}, {
    skip: !isAuthenticated || !user,
  });
  
  // Format orders data
  const orders = ordersData?.data?.map(formatOrderData) || [];
  
  // Calculate statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.slice(0, 3);

  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div
            className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:inset-auto lg:w-64 lg:flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <div className="flex items-center justify-between p-4 border-b lg:hidden">
              <h2 className="text-lg font-semibold">My Account</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="lg:hidden fixed top-4 left-4 z-60">
              {!sidebarOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>

            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Orders
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ordersLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          totalOrders
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ordersLoading ? "Loading..." : "Total orders"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Wishlist Items
                      </CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">
                        3 back in stock
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Spent
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ordersLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          `$${totalSpent.toFixed(2)}`
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ordersLoading ? "Loading..." : "Total spent"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                      Your latest order activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading orders...</span>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500">Failed to load orders</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Please try refreshing the page
                        </p>
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No orders yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Your recent orders will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">
                                  {order.status}
                                </span>
                              </Badge>
                              <p className="font-medium">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Content */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      Track and manage your orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading orders...</span>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500">Failed to load orders</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Please try refreshing the page
                        </p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Your order history will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold">{order.orderNumber}</h3>
                                <p className="text-sm text-gray-500">
                                  Ordered on {new Date(order.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">
                                  {order.status}
                                </span>
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-4"
                                  >
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {item.name || item.title || `Product ${index + 1}`}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        ${item.price || 0}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">Order Items</p>
                                    <p className="text-sm text-gray-500">
                                      Quantity: {order.quantity || 1}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">
                                  Total: ${order.total.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Payment: {order.paymentMethod?.replace('_', ' ')} 
                                  {order.paymentStatus ? ' ✓' : ' ✗'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                {order.status === "delivered" && (
                                  <Button variant="outline" size="sm">
                                    Reorder
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Wishlist Content */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>
                      Items you've saved for later
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {mockWishlist.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold mb-2">{item.name}</h3>
                          <p className="text-lg font-bold text-blue-600 mb-2">
                            ${item.price}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <Badge
                              variant={item.inStock ? "default" : "secondary"}
                            >
                              {item.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" disabled={!item.inStock}>
                              Add to Cart
                            </Button>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" disabled={!item.inStock}>
                              Buy Now
                            </Button>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Addresses Content */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Shipping Addresses</CardTitle>
                      <CardDescription>
                        Manage your delivery addresses
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {mockAddresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={
                                address.isDefault ? "default" : "secondary"
                              }
                            >
                              {address.type}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                          <div className="space-y-1 mb-4">
                            <p className="font-medium">{address.name}</p>
                            <p className="text-sm text-gray-600">
                              {address.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.zip}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Methods Content */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Manage your saved payment methods
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPaymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {method.type} ending in {method.last4}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expires {method.expiry}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {method.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Content */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage your privacy preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive order updates and promotions
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Export</p>
                        <p className="text-sm text-gray-500">
                          Download your account data
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
