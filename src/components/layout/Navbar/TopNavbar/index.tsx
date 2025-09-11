"use client";

import InputGroup from "@/components/ui/input-group";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { NavMenu } from "../navbar.types";
import CartBtn from "./CartBtn";
import { MenuItem } from "./MenuItem";
import { MenuList } from "./MenuList";
import ResTopNavbar from "./ResTopNavbar";
import { useDynamicMenus, DynamicMenu, DynamicMenuItem } from "@/hooks/use-dynamic-menus";
import { useLogo } from "@/hooks/use-logo";

// Fallback static data
const fallbackData: NavMenu = [
  {
    id: 1,
    label: "Shop",
    type: "MenuList",
    children: [
      {
        id: 11,
        label: "Men's clothes",
        url: "/shop#men-clothes",
        description: "In attractive and spectacular colors and designs",
      },
      {
        id: 12,
        label: "Women's clothes",
        url: "/shop#women-clothes",
        description: "Ladies, your style and tastes are important to us",
      },
      {
        id: 13,
        label: "Kids clothes",
        url: "/shop#kids-clothes",
        description: "For all ages, with happy and beautiful colors",
      },
      {
        id: 14,
        label: "Bags and Shoes",
        url: "/shop#bag-shoes",
        description: "Suitable for men, women and all tastes and styles",
      },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "On Sale",
    url: "/shop#on-sale",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "New Arrivals",
    url: "/shop#new-arrivals",
    children: [],
  },
  {
    id: 4,
    type: "MenuItem",
    label: "Brands",
    url: "/shop#brands",
    children: [],
  },
];

// Convert dynamic menu items to NavMenu format
const convertDynamicMenuToNavMenu = (dynamicMenus: DynamicMenu[]): NavMenu => {
  const navMenuItems: NavMenu = [];

  dynamicMenus.forEach((menu) => {
    if (menu.items && menu.items.length > 0) {
      // If menu has items, create a MenuList
      const children = menu.items
        .filter(item => item.isActive)
        .sort((a, b) => a.order - b.order)
        .map((item: DynamicMenuItem) => ({
          id: item.id,
          label: item.label,
          url: item.url,
          description: item.description || "",
        }));

      if (children.length > 0) {
        navMenuItems.push({
          id: menu._id ? parseInt(menu._id.slice(-4), 16) : Math.random() * 1000,
          label: menu.name,
          type: "MenuList",
          children,
        });
      }
    } else {
      // If menu has no items, create a MenuItem
      navMenuItems.push({
        id: menu._id ? parseInt(menu._id.slice(-4), 16) : Math.random() * 1000,
        label: menu.name,
        type: "MenuItem",
        url: `/${menu.slug}`,
        children: [],
      });
    }
  });

  return navMenuItems;
};

const TopNavbar = () => {
  const { menus, loading, error } = useDynamicMenus();
  const { logo, loading: logoLoading, error: logoError } = useLogo();
  
  // Convert dynamic menus to NavMenu format or use fallback
  const menuData = menus.length > 0 ? convertDynamicMenuToNavMenu(menus) : fallbackData;
  
  // Debug logging
  console.log('🔍 TopNavbar Debug:', {
    loading,
    error,
    menusCount: menus.length,
    menuDataCount: menuData.length,
    usingFallback: menus.length === 0,
    menuData,
    logo: logo ? { url: logo.url, altText: logo.altText } : null,
    logoLoading,
    logoError
  });


  console.log('logo at 138', logo)

  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={menuData} />
          </div>
          <Link
            href="/"
            className="mr-3 lg:mr-10"
          >
            {logoLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            ) : logoError ? (
              <span className={cn([
                integralCF.className,
                "text-2xl lg:text-[32px] mb-2",
              ])}>
               CodeZyne
              </span>
            ) : logo ? (
              <Image
                src={logo.url}
                alt={logo.altText}
                width={100}
                height={100}
                // className="h-8 lg:h-10 w-auto object-contain"
                priority
              />
            ) : (
              <span className={cn([
                integralCF.className,
                "text-2xl lg:text-[32px] mb-2",
              ])}>
                CodeZyne
              </span>
            )}
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-6 w-18 rounded"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm">Error loading menus</div>
            ) : (
              menuData.map((item) => (
                <React.Fragment key={item.id}>
                  {item.type === "MenuItem" && (
                    <MenuItem label={item.label} url={item.url} />
                  )}
                  {item.type === "MenuList" && (
                    <MenuList data={item.children} label={item.label} />
                  )}
                </React.Fragment>
              ))
            )}
          </NavigationMenuList>
        </NavigationMenu>
        <InputGroup className="hidden md:flex bg-[#F0F0F0] mr-3 lg:mr-10">
          <InputGroup.Text>
            <Image
              priority
              src="/icons/search.svg"
              height={20}
              width={20}
              alt="search"
              className="min-w-5 min-h-5"
            />
          </InputGroup.Text>
          <InputGroup.Input
            type="search"
            name="search"
            placeholder="Search for products..."
            className="bg-transparent placeholder:text-black/40"
          />
        </InputGroup>
        <div className="flex items-center">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <Link href="/signin" className="p-1">
            <Image
              priority
              src="/icons/user.svg"
              height={100}
              width={100}
              alt="user"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
