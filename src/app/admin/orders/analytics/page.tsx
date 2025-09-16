"use client";

import { OrderAnalytics, OrdersBreadcrumb } from "../components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsOrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OrdersBreadcrumb currentPage="Analytics" />
      
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Analytics</h2>
          <p className="text-muted-foreground">
            View detailed analytics and insights for your orders
          </p>
        </div>
      </div>

      <OrderAnalytics />
    </div>
  );
}
