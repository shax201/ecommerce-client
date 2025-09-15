"use client";

import { useState, useEffect } from "react";
import { OrderData, OrderResponse, OrderTracking } from "@/actions/orders";

// ISR hook for orders data
export function useOrdersISR(initialData?: {
  orders?: OrderData[];
  userOrders?: OrderData[];
  orderAnalytics?: any;
  orderTracking?: OrderTracking;
}) {
  const [ordersData, setOrdersData] = useState<OrderData[]>(initialData?.orders || []);
  const [userOrdersData, setUserOrdersData] = useState<OrderData[]>(initialData?.userOrders || []);
  const [orderAnalyticsData, setOrderAnalyticsData] = useState<any>(initialData?.orderAnalytics || null);
  const [orderTrackingData, setOrderTrackingData] = useState<OrderTracking | null>(initialData?.orderTracking || null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    ordersFromServer: !!initialData?.orders,
    userOrdersFromServer: !!initialData?.userOrders,
    analyticsFromServer: !!initialData?.orderAnalytics,
    trackingFromServer: !!initialData?.orderTracking,
  });

  // Update data source when data changes
  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      ordersFromServer: ordersData.length > 0,
      userOrdersFromServer: userOrdersData.length > 0,
      analyticsFromServer: !!orderAnalyticsData,
      trackingFromServer: !!orderTrackingData,
    }));
  }, [ordersData, userOrdersData, orderAnalyticsData, orderTrackingData]);

  return {
    ordersData,
    userOrdersData,
    orderAnalyticsData,
    orderTrackingData,
    isLoading,
    hasError,
    dataSource,
    setOrdersData,
    setUserOrdersData,
    setOrderAnalyticsData,
    setOrderTrackingData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for user orders specifically
export function useUserOrdersISR(userId: string, initialData?: OrderData[]) {
  const [userOrdersData, setUserOrdersData] = useState<OrderData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    userOrdersFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      userOrdersFromServer: userOrdersData.length > 0,
    }));
  }, [userOrdersData]);

  return {
    userOrdersData,
    isLoading,
    hasError,
    dataSource,
    setUserOrdersData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for order analytics
export function useOrderAnalyticsISR(initialData?: any) {
  const [orderAnalyticsData, setOrderAnalyticsData] = useState<any>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    analyticsFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      analyticsFromServer: !!orderAnalyticsData,
    }));
  }, [orderAnalyticsData]);

  return {
    orderAnalyticsData,
    isLoading,
    hasError,
    dataSource,
    setOrderAnalyticsData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for order tracking
export function useOrderTrackingISR(orderId: string, initialData?: OrderTracking) {
  const [orderTrackingData, setOrderTrackingData] = useState<OrderTracking | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    trackingFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      trackingFromServer: !!orderTrackingData,
    }));
  }, [orderTrackingData]);

  return {
    orderTrackingData,
    isLoading,
    hasError,
    dataSource,
    setOrderTrackingData,
    setIsLoading,
    setHasError,
  };
}
