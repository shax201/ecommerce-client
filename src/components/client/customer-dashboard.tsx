"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  User,
  MapPin,
  Shield,
  BarChart3,
  Home,
  TrendingUp,
  History,
} from "lucide-react";

import { OrderManagement } from "./order-management";
import { DashboardOverview } from "./dashboard-overview";
import { OrderTrackingCharts } from "./order-tracking-charts";
import { OrderHistory } from "./order-history";
import { ProfileManagement } from "./profile-management";
import { AddressManagement } from "./address-management";
import { SecuritySettings } from "./security-settings";

// Mock data for demonstration
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/diverse-user-avatars.png",
  joinDate: "2023-01-15",
  totalOrders: 24,
  totalSpent: 2847.5,
};

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Customer Dashboard
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Manage your orders and account
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {mockUser.name}
                </p>
                <p className="text-xs text-slate-500">{mockUser.email}</p>
              </div>
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage
                  src={mockUser.avatar || "/placeholder.svg"}
                  alt={mockUser.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm p-1 text-slate-500 shadow-sm border border-slate-200/60 min-w-full lg:min-w-0">
              <TabsTrigger
                value="overview"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="tracking"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Tracking</span>
              </TabsTrigger>
              {/* <TabsTrigger
                value="history"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <History className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger> */}
              <TabsTrigger
                value="profile"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm gap-2 min-w-0 flex-1 lg:flex-initial"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[600px]">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrderManagement />
            </TabsContent>

            <TabsContent value="tracking" className="mt-0">
              <OrderTrackingCharts />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <OrderHistory />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <ProfileManagement />
            </TabsContent>

            <TabsContent value="addresses" className="mt-0">
              <AddressManagement />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
