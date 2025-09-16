"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Truck, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/lib/hooks/redux";
import { usePurchaseProductMutation } from "@/lib/features/products/productApi";
import { 
  useGetDefaultShippingAddressQuery,
  useCreateShippingAddressMutation 
} from "@/lib/features/shipping-address";
import { useValidateProductCouponMutation } from "@/lib/features/coupons/couponsApi";

import BreadcrumbProduct from "../product-page/BreadcrumbProduct";

export function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const { cart, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const router = useRouter();
  const [purchaseProduct, { isLoading }] = usePurchaseProductMutation();
  const [validateProductCoupon, { isLoading: isValidatingCoupon }] = useValidateProductCouponMutation();

  // Coupon-related state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(adjustedTotalPrice);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Get user ID from localStorage for the query
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get default shipping address using Redux query
  const { 
    data: defaultAddressData, 
    isLoading: isDefaultAddressLoading, 
    error: defaultAddressError 
  } = useGetDefaultShippingAddressQuery({ userId }, {
    skip: !userId, // Skip query if no userId
  });

  // Create shipping address mutation
  const [createShippingAddress, { isLoading: isCreatingAddress }] = useCreateShippingAddressMutation();

  // Set user ID on component mount
  useEffect(() => {
    const user = localStorage.getItem("client");
    if (user) {
      const userObj = JSON.parse(user);
      setUserId(userObj._id);
    }
  }, []);

  // Update form data when default address is loaded
  useEffect(() => {
    if (defaultAddressData?.data && userId) {
      const defaultAddress = defaultAddressData.data;
      const user = localStorage.getItem("client");
      const userObj = user ? JSON.parse(user) : null;

      console.log('🏠 [Checkout] Default address received:', defaultAddress);

      // Parse the name to get first and last name
      const nameParts = defaultAddress.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: userObj?.email || '',
        phone: defaultAddress.phone.toString(), // Convert to string for form
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zip: defaultAddress.zip,
        country: defaultAddress.country,
      }));
    }
  }, [defaultAddressData, userId]);

  // Update loading state based on Redux query
  useEffect(() => {
    setIsLoadingAddress(isDefaultAddressLoading);
  }, [isDefaultAddressLoading]);

  // Update final price when adjustedTotalPrice changes
  useEffect(() => {
    if (appliedCoupon) {
      setFinalPrice(adjustedTotalPrice - discountAmount);
    } else {
      setFinalPrice(adjustedTotalPrice);
    }
  }, [adjustedTotalPrice, appliedCoupon, discountAmount]);

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!cart?.items?.length) {
      setCouponError("No items in cart");
      return;
    }

    const user = localStorage.getItem("client");
    const userObj = user ? JSON.parse(user) : null;
    const productIds = cart.items.map((item) => item.id);

    try {
      setCouponError("");
      const response = await validateProductCoupon({
        couponCode: couponCode.trim(),
        productIds,
        userId: userObj?._id,
      }).unwrap();

      if (response.success && response.data?.isValid) {
        const coupon = response.data.coupon;
        setAppliedCoupon(coupon);
        
        // Calculate discount amount
        let calculatedDiscount = 0;
        if (coupon.discountType === "fixed") {
          calculatedDiscount = Math.min(coupon.discountValue, adjustedTotalPrice);
        } else {
          calculatedDiscount = (adjustedTotalPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscountAmount) {
            calculatedDiscount = Math.min(calculatedDiscount, coupon.maximumDiscountAmount);
          }
        }
        
        setDiscountAmount(calculatedDiscount);
        setFinalPrice(adjustedTotalPrice - calculatedDiscount);
      } else {
        setCouponError(response.data?.error || "Invalid coupon code");
      }
    } catch (error: any) {
      setCouponError(error?.data?.error || "Failed to validate coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    setDiscountAmount(0);
    setFinalPrice(adjustedTotalPrice);
  };

  const checkoutHandler = async () => {
    const user = localStorage.getItem("client");
    if (!user || !cart?.items?.length) return;

    const userObj = JSON.parse(user);
    const productIds = cart.items.map((pro) => pro.id);

    try {
      // Save shipping address if it doesn't exist as default
      if (userId && !defaultAddressData?.data) {
        const addressData = {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: parseInt(formData.phone) || 0, // Convert to number for backend
          isDefault: true,
          user: userId, // Add user ID
        };

        console.log('💾 [Checkout] Saving shipping address:', addressData);
        await createShippingAddress(addressData).unwrap();
        console.log('✅ [Checkout] Shipping address saved successfully');
      }

      // Map payment method to backend expected values
      const getPaymentMethod = (method: string) => {
        switch (method) {
          case "card":
            return "credit_card";
          case "paypal":
            return "paypal";
          case "apple":
            return "stripe"; // Apple Pay typically uses Stripe
          case "cash_on_delivery":
            return "cash_on_delivery";
          default:
            return "credit_card";
        }
      };

      const orderPayload: any = {
        user: userObj._id,
        productID: productIds,
        paymentMethod: getPaymentMethod(paymentMethod),
        totalPrice: finalPrice,
        quantity: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        shipping: {
          _id: defaultAddressData?.data?._id,
          country: formData.country,
          phone: parseInt(formData.phone) || 0, // Convert phone to number
          zip: formData.zip,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        },
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
      };

      console.log("orderPayload", orderPayload);
      if (paymentMethod === "card") {
        orderPayload.cardDetails = {
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          cvv: formData.cvv,
          cardName: formData.cardName,
        };
      }

      const response = await purchaseProduct(orderPayload).unwrap();
      if (response?.success) {
        router.push("/account");
      }
    } catch (err: any) {
      console.error("Failed to process checkout:", err);
      // Show user-friendly error message
      const errorMessage = err?.data?.message || err?.message || "Failed to process checkout. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BreadcrumbProduct title={"checkout"} />

        <h1 className="text-4xl font-bold mb-8">CHECKOUT</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Shipping Information</span>
                  {isLoadingAddress && (
                    <span className="text-sm text-gray-500 ml-2">(Loading default address...)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder={isLoadingAddress ? "Loading..." : "John"}
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder={isLoadingAddress ? "Loading..." : "Doe"}
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isLoadingAddress ? "Loading..." : "john.doe@example.com"}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoadingAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder={isLoadingAddress ? "Loading..." : "+1 (555) 123-4567"}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoadingAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder={isLoadingAddress ? "Loading..." : "123 Main Street"}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoadingAddress}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder={isLoadingAddress ? "Loading..." : "New York"}
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder={isLoadingAddress ? "Loading..." : "NY"}
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder={isLoadingAddress ? "Loading..." : "10001"}
                      value={formData.zip}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder={isLoadingAddress ? "Loading..." : "United States"}
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isLoadingAddress}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Credit/Debit Card</span>
                        <div className="flex space-x-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                            MC
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>PayPal</span>
                        <div className="w-16 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                          PayPal
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="apple" id="apple" />
                    <Label htmlFor="apple" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Apple Pay</span>
                        <div className="w-16 h-5 bg-black rounded text-white text-xs flex items-center justify-center">
                          Apple Pay
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>Cash on Delivery</span>
                        <div className="w-16 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">
                          COD
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Coupon Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!appliedCoupon ? (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCouponValidation}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      variant="outline"
                    >
                      {isValidatingCoupon ? "Validating..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700 font-medium">
                        {appliedCoupon.code} applied
                      </span>
                      <Badge variant="secondary" className="text-green-700">
                        {appliedCoupon.discountType === "fixed" 
                          ? `$${appliedCoupon.discountValue} off`
                          : `${appliedCoupon.discountValue}% off`
                        }
                      </Badge>
                    </div>
                    <Button
                      onClick={handleRemoveCoupon}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-sm text-red-600">{couponError}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart &&
                  cart?.items?.length > 0 &&
                  cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <img
                          src={item.srcUrl}
                          alt="Product"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.attributes[0]}
                        </p>
                        <p className="text-sm text-gray-600">
                          Color: {item.attributes[1]}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-bold">$10</span>
                          <span className="text-gray-400 line-through text-sm">
                            ${item.price}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {item.discount.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${adjustedTotalPrice}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.80</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Your payment information is secure
                  </span>
                </div>

                <Button
                  onClick={checkoutHandler}
                  disabled={isLoading || isCreatingAddress}
                  className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
                >
                  {isLoading || isCreatingAddress ? "Processing..." : "Place Order"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
