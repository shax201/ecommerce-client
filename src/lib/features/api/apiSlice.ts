"use client";


import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";

// Create a new mutex
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1",
  prepareHeaders: (headers) => {
    // Get token from localStorage (primary) or cookie (fallback)
    let token = null;
    
    // Try localStorage first
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('admin-token')  || localStorage.getItem('user-token'); 
    }
    
    // Fallback to cookie if localStorage is not available
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|;) ?user-token=([^;]*)/);
      token = match?.[2];
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      console.log('🔐 [Redux API] Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️ [Redux API] No token found in localStorage or cookies');
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  // Debug: Check if token is available (only in browser)
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^|;) ?user-token=([^;]*)/);
    if (match) {
      console.log("🍪 [Redux API] Cookie token found:", match[2].substring(0, 20) + "...");
    }
  }

  // Check localStorage token (only in browser)
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('user-token');
    if (localToken) {
      console.log("💾 [Redux API] localStorage token found:", localToken.substring(0, 20) + "...");
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Category", "ShippingAddress", "Order", "OrderAnalytics", "Coupon", "Report", "ReportTemplate", "SalesReport", "OrdersReport", "ProductsReport", "CustomersReport", "InventoryReport", "CouponsReport", "AnalyticsReport", "FinancialReport", "Color", "Size", "Permission", "Role", "UserRole", "CurrentUserPermissions", "UserPermissions", "User", "Logo", "HeroSection", "UserSettings", "DynamicMenu", "ClientLogo"],
  endpoints: (builder) => ({}),
});
