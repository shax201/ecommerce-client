"use client";

import { useState } from "react";
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

import BreadcrumbProduct from "../product-page/BreadcrumbProduct";

export function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { cart, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const router = useRouter();
  const [purchaseProduct, { isLoading }] = usePurchaseProductMutation();

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

  const checkoutHandler = async () => {
    const user = localStorage.getItem("client");
    if (!user || !cart?.items?.length) return;

    const match = document.cookie.match(/(^|;) ?user-token=([^;]*)/);

    if (match) {
      console.log("match", match[2]);
    }

    const userObj = JSON.parse(user);
    const productIds = cart.items.map((pro) => pro.id);

    const orderPayload: any = {
      clientID: userObj._id,
      productID: productIds,
      paymentMethod,
      totalPrice: adjustedTotalPrice,
      quantity: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      shipping: {
        country: formData.country,
        phone: formData.phone,
        zip: formData.zip,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
      },
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

    try {
      const response = await purchaseProduct(orderPayload).unwrap();
      if (response?.success) {
        router.push("/account");
      }
    } catch (err) {
      console.error("Failed to purchase", err);
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="10001"
                      value={formData.zip}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={handleChange}
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
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
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
                  <div className="flex justify-between text-red-600">
                    <span>Discount (-50%)</span>
                    <span>-$10</span>
                  </div>
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
                    <span>${adjustedTotalPrice}</span>
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
                  disabled={isLoading}
                  className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
                >
                  {isLoading ? "Placing..." : "Place Order"}
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
