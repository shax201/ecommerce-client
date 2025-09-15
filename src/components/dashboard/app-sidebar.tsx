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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Attributes",
      url: "/attributes",
      icon: Bookmark,
      submenu: [
        {
          title: "Colors",
          url: "/attributes/colors",
        },
        {
          title: "Sizes",
          url: "/attributes/sizes",
        },
      ],
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tags,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
    {
      title: "Orders (by Shahadat)",
      url: "/orders",
      icon: ShoppingCart,
      submenu: [
        {
          title: "All Orders",
          url: "/orders/all",
        },
        {
          title: "Track Orders",
          url: "/orders/track",
        },
        {
          title: "Analytics",
          url: "/orders/analytics",
        },
      ],
    },
    {
      title: "Coupons (by Shahadat)",
      url: "/coupons",
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Content (by Shahadat)",
      url: "/content",
      icon: FileText,
    },
    {
      title: "Reports (by Shahadat)",
      url: "/reports",
      icon: BarChart3,
      submenu: [
        // {
        //   title: "Overview",
        //   url: "/reports",
        // },
        // {
        //   title: "Sales Reports",
        //   url: "/reports/sales",
        // },
        {
          title: "Orders Reports",
          url: "/reports/orders",
        },
        // {
        //   title: "Products Reports",
        //   url: "/reports/products",
        // },
        // {
        //   title: "Customers Reports",
        //   url: "/reports/customers",
        // },
        // {
        //   title: "Inventory Reports",
        //   url: "/reports/inventory",
        // },
        // {
        //   title: "Coupons Reports",
        //   url: "/reports/coupons",
        // },
        // {
        //   title: "Analytics Reports",
        //   url: "/reports/analytics",
        // },
        // {
        //   title: "Financial Reports",
        //   url: "/reports/financial",
        // },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Settings  (by Shahadat)",
      url: "/dashboard/settings",
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
