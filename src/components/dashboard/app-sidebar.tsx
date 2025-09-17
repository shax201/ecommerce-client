"use client";

import * as React from "react";
import {
  Bookmark,
  HelpCircleIcon,
  Home,
  Package,
  SearchIcon,
  SettingsIcon,
  ShoppingCart,
  Tag,
  Tags,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Archive,
  DollarSign,
  Settings,
  Shield,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { PermissionGate } from "@/components/common/PermissionGate";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Attributes",
      url: "/admin/attributes",
      icon: Bookmark,
      submenu: [
        {
          title: "Colors",
          url: "/admin/attributes/colors",
        },
        {
          title: "Sizes",
          url: "/admin/attributes/sizes",
        },
      ],
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: Tags,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCart,
      submenu: [
        {
          title: "All Orders",
          url: "/admin/orders/all",
        },
        {
          title: "Track Orders",
          url: "/admin/orders/track",
        },
        {
          title: "Analytics",
          url: "/admin/orders/analytics",
        },
      ],
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: Users,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: UserCog,
    },
    {
      title: "Content",
      url: "/admin/content",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: BarChart3,
      submenu: [
        {
          title: "Orders Reports",
          url: "/admin/reports/orders",
        },
      ],
    },
    {
      title: "Permissions",
      url: "/admin/permissions",
      icon: Shield,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },

  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
