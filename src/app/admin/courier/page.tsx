"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Package, Truck, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store";
import { setActiveTab } from "@/lib/features/courier";
import { useGetCourierStatsQuery } from "@/lib/features/courier/courierApi";
import CourierCredentialsManagement from "./components/courier-credentials-management";
import CourierOrdersManagement from "./components/courier-orders-management";
import CourierOperationsManagement from "./components/courier-operations-management";

export default function CourierPage() {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((state: RootState) => state.courier.ui);
  
  // Fetch courier stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetCourierStatsQuery();

  const handleTabChange = (value: string) => {
    dispatch(setActiveTab(value as 'credentials' | 'orders' | 'operations'));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courier Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage courier credentials, orders, and operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            disabled={statsLoading}
          >
            <Settings className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          {/* <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Courier
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Couriers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : statsError ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.data?.activeCouriers?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.data?.activeCouriers?.description || 'No active couriers'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : statsError ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.data?.totalOrders?.count?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.data?.totalOrders?.description || 'No data available'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : statsError ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.data?.pendingOrders?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.data?.pendingOrders?.description || 'No data available'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : statsError ? (
              <div className="text-sm text-red-500">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.data?.successRate?.percentage?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.data?.successRate?.description || 'No data available'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Courier Management</CardTitle>
          <CardDescription>
            Configure courier services, manage orders, and track deliveries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Credentials</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
              {/* <TabsTrigger value="operations" className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Operations</span>
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              <CourierCredentialsManagement />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <CourierOrdersManagement />
            </TabsContent>

            {/* <TabsContent value="operations" className="space-y-4">
              <CourierOperationsManagement />
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
