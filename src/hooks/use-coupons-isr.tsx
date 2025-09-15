"use client";

import { useState, useEffect } from "react";
import { Coupon, CouponValidationRequest, CouponValidationResponse } from "@/types/coupon.types";

// ISR hook for coupons data
export function useCouponsISR(initialData?: {
  coupons?: Coupon[];
  activeCoupons?: Coupon[];
  singleCoupon?: Coupon;
  validationResult?: CouponValidationResponse;
}) {
  const [couponsData, setCouponsData] = useState<Coupon[]>(initialData?.coupons || []);
  const [activeCouponsData, setActiveCouponsData] = useState<Coupon[]>(initialData?.activeCoupons || []);
  const [singleCouponData, setSingleCouponData] = useState<Coupon | null>(initialData?.singleCoupon || null);
  const [validationData, setValidationData] = useState<CouponValidationResponse | null>(initialData?.validationResult || null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    couponsFromServer: !!initialData?.coupons,
    activeCouponsFromServer: !!initialData?.activeCoupons,
    singleCouponFromServer: !!initialData?.singleCoupon,
    validationFromServer: !!initialData?.validationResult,
  });

  // Update data source when data changes
  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      couponsFromServer: couponsData.length > 0,
      activeCouponsFromServer: activeCouponsData.length > 0,
      singleCouponFromServer: !!singleCouponData,
      validationFromServer: !!validationData,
    }));
  }, [couponsData, activeCouponsData, singleCouponData, validationData]);

  return {
    couponsData,
    activeCouponsData,
    singleCouponData,
    validationData,
    isLoading,
    hasError,
    dataSource,
    setCouponsData,
    setActiveCouponsData,
    setSingleCouponData,
    setValidationData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for active coupons specifically
export function useActiveCouponsISR(initialData?: Coupon[]) {
  const [activeCouponsData, setActiveCouponsData] = useState<Coupon[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    activeCouponsFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      activeCouponsFromServer: activeCouponsData.length > 0,
    }));
  }, [activeCouponsData]);

  return {
    activeCouponsData,
    isLoading,
    hasError,
    dataSource,
    setActiveCouponsData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for single coupon
export function useSingleCouponISR(couponId: string, initialData?: Coupon) {
  const [singleCouponData, setSingleCouponData] = useState<Coupon | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    singleCouponFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      singleCouponFromServer: !!singleCouponData,
    }));
  }, [singleCouponData]);

  return {
    singleCouponData,
    isLoading,
    hasError,
    dataSource,
    setSingleCouponData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for coupon validation
export function useCouponValidationISR(initialData?: CouponValidationResponse) {
  const [validationData, setValidationData] = useState<CouponValidationResponse | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    validationFromServer: !!initialData,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      validationFromServer: !!validationData,
    }));
  }, [validationData]);

  return {
    validationData,
    isLoading,
    hasError,
    dataSource,
    setValidationData,
    setIsLoading,
    setHasError,
  };
}

// ISR hook for coupons with pagination
export function useCouponsWithPaginationISR(initialData?: {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}) {
  const [couponsData, setCouponsData] = useState<Coupon[]>(initialData?.coupons || []);
  const [paginationData, setPaginationData] = useState(initialData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dataSource, setDataSource] = useState({
    couponsFromServer: !!initialData?.coupons,
  });

  useEffect(() => {
    setDataSource(prev => ({
      ...prev,
      couponsFromServer: couponsData.length > 0,
    }));
  }, [couponsData]);

  return {
    couponsData,
    paginationData,
    isLoading,
    hasError,
    dataSource,
    setCouponsData,
    setPaginationData,
    setIsLoading,
    setHasError,
  };
}
