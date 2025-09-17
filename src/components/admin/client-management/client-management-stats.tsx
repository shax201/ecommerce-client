"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { ClientStats } from "@/lib/services/client-management-service";

interface ClientManagementStatsProps {
  stats: ClientStats | null;
  loading: boolean;
}

export function ClientManagementStats({ stats, loading }: ClientManagementStatsProps) {
  console.log('ClientManagementStats received:', { stats, loading });
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely access stats properties with fallbacks
  const totalClients = stats?.totalClients ?? 0;
  const activeClients = stats?.activeClients ?? 0;
  const inactiveClients = stats?.inactiveClients ?? 0;
  const newClientsThisMonth = stats?.newClientsThisMonth ?? 0;
  const newClientsThisWeek = stats?.newClientsThisWeek ?? 0;

  const activePercentage = totalClients > 0 
    ? Math.round((activeClients / totalClients) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All registered clients
          </p>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {activeClients.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {activePercentage}% of total clients
          </p>
        </CardContent>
      </Card>

      {/* Inactive Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {inactiveClients.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {100 - activePercentage}% of total clients
          </p>
        </CardContent>
      </Card>

      {/* New Clients This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {newClientsThisMonth.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            New registrations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
