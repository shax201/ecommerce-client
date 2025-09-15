"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useValidateProductCouponMutation } from "@/lib/features/coupons/couponsApi";

interface CouponTestComponentProps {
  productIds: string[];
  userId?: string;
  orderValue: number;
}

export function CouponTestComponent({ 
  productIds, 
  userId, 
  orderValue 
}: CouponTestComponentProps) {
  const [couponCode, setCouponCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [validateCoupon, { isLoading }] = useValidateProductCouponMutation();

  const handleTestCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    try {
      setError("");
      const response = await validateCoupon({
        couponCode: couponCode.trim(),
        productIds,
        userId,
      }).unwrap();

      if (response.success && response.data?.isValid) {
        setValidationResult(response.data);
      } else {
        setError(response.data?.error || "Invalid coupon code");
        setValidationResult(null);
      }
    } catch (error: any) {
      setError(error?.data?.error || "Failed to validate coupon");
      setValidationResult(null);
    }
  };

  const calculateDiscount = (coupon: any) => {
    if (coupon.discountType === "fixed") {
      return Math.min(coupon.discountValue, orderValue);
    } else {
      const discount = (orderValue * coupon.discountValue) / 100;
      return coupon.maximumDiscountAmount 
        ? Math.min(discount, coupon.maximumDiscountAmount)
        : discount;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Coupon Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleTestCoupon}
            disabled={isLoading || !couponCode.trim()}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {validationResult && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-700 font-medium">
                  {validationResult.coupon?.code}
                </span>
                <Badge variant="secondary" className="text-green-700">
                  {validationResult.coupon?.discountType === "fixed" 
                    ? `$${validationResult.coupon?.discountValue} off`
                    : `${validationResult.coupon?.discountValue}% off`
                  }
                </Badge>
              </div>
              <p className="text-sm text-green-600">
                {validationResult.coupon?.description}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order Value:</span>
                <span>${orderValue}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${calculateDiscount(validationResult.coupon).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Final Amount:</span>
                <span>${(orderValue - calculateDiscount(validationResult.coupon)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Order Value: ${orderValue}</p>
          <p>Product IDs: {productIds.join(", ")}</p>
          {userId && <p>User ID: {userId}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
