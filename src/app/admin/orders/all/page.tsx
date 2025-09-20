"use client";

import { useState } from "react";
import { useGetOrdersQuery } from "@/lib/features/orders";
import { OrdersList, ExportOrders, OrdersBreadcrumb } from "../components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AllOrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery();
  const orders = ordersData?.data || [];

  if (ordersLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">All Orders</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">All Orders</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OrdersBreadcrumb currentPage="All Orders" />
      
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Orders</h2>
          <p className="text-muted-foreground">
            Manage and view all orders in your store
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportOrders 
            orders={orders}
            selectedOrders={selectedOrders}
          />
        </div>
      </div>

      <OrdersList 
        orders={orders}
        selectedOrders={selectedOrders}
        onSelectionChange={setSelectedOrders}
      />
    </div>
  );
}
