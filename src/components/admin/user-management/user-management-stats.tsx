"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserStats } from "@/lib/services/user-management-service";
import { Users, UserCheck, UserX, Shield, TrendingUp, Clock } from "lucide-react";

interface UserManagementStatsProps {
  stats: UserStats;
}

export function UserManagementStats({ stats }: UserManagementStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      icon: UserX,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Suspended Users",
      value: stats.suspendedUsers,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Admin Users",
      value: stats.adminUsers,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Client Users",
      value: stats.clientUsers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const growthCards = [
    {
      title: "New This Month",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "New This Week",
      value: stats.newUsersThisWeek,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  const loginStats = [
    {
      title: "Today",
      value: stats.lastLoginStats.today,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "This Week",
      value: stats.lastLoginStats.thisWeek,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "This Month",
      value: stats.lastLoginStats.thisMonth,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

 

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                User Distribution
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active</span>
                  <span className="font-medium">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inactive</span>
                  <span className="font-medium">
                    {((stats.inactiveUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Suspended</span>
                  <span className="font-medium">
                    {((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Role Distribution
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Admins</span>
                  <span className="font-medium">
                    {((stats.adminUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Clients</span>
                  <span className="font-medium">
                    {((stats.clientUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Recent Activity
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <Badge variant="outline">{stats.newUsersThisMonth} new</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <Badge variant="outline">{stats.newUsersThisWeek} new</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Logged in Today</span>
                  <Badge variant="outline">{stats.lastLoginStats.today}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}