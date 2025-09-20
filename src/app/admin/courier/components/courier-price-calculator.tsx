"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCalculateCourierPriceMutation } from "@/lib/features/courier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, MapPin, Clock, AlertCircle } from "lucide-react";
import { CourierType } from "@/types/courier.types";

// Form validation schema
const priceCalculatorSchema = z.object({
  courier: z.enum(['pathao', 'steadfast'], {
    message: "Please select a courier service",
  }),
  orderData: z.object({
    orderNumber: z.string().min(1, "Order number is required"),
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().min(1, "Customer phone is required"),
    customerAddress: z.string().min(1, "Customer address is required"),
    customerCity: z.string().min(1, "City is required"),
    customerArea: z.string().min(1, "Area is required"),
    customerPostCode: z.string().optional(),
    items: z.array(z.object({
      name: z.string().min(1, "Item name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
      price: z.number().min(0, "Price must be positive"),
    })).min(1, "At least one item is required"),
    deliveryCharge: z.number().min(0, "Delivery charge must be positive"),
    totalAmount: z.number().min(0, "Total amount must be positive"),
    notes: z.string().optional(),
  }),
});

type PriceCalculatorFormValues = z.infer<typeof priceCalculatorSchema>;

export default function CourierPriceCalculator() {
  const [calculatePrice, { isLoading, data: priceData, error }] = useCalculateCourierPriceMutation();
  const [items, setItems] = useState([{ name: '', quantity: 1, weight: 0.1, price: 0 }]);

  const form = useForm<PriceCalculatorFormValues>({
    resolver: zodResolver(priceCalculatorSchema),
    defaultValues: {
      courier: 'pathao',
      orderData: {
        orderNumber: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerCity: '',
        customerArea: '',
        customerPostCode: '',
        items: [{ name: '', quantity: 1, weight: 0.1, price: 0 }],
        deliveryCharge: 0,
        totalAmount: 0,
        notes: '',
      },
    },
  });

  const selectedCourier = form.watch('courier');

  const calculateTotal = useCallback(() => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const deliveryCharge = form.getValues('orderData.deliveryCharge') || 0;
    const total = itemsTotal + deliveryCharge;
    form.setValue('orderData.totalAmount', total);
    return total;
  }, [items, form]);

  const addItem = useCallback(() => {
    const newItems = [...items, { name: '', quantity: 1, weight: 0.1, price: 0 }];
    setItems(newItems);
    form.setValue('orderData.items', newItems);
  }, [items, form]);

  const removeItem = useCallback((index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue('orderData.items', newItems);
    }
  }, [items, form]);

  const updateItem = useCallback((index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    form.setValue('orderData.items', newItems);
  }, [items, form]);

  const calculateTotalWeight = useCallback(() => {
    return items.reduce((total, item) => total + (item.quantity * item.weight), 0);
  }, [items]);

  const calculateTotalValue = useCallback(() => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  }, [items]);

  const onSubmit = async (data: PriceCalculatorFormValues) => {
    try {
      await calculatePrice({
        courier: data.courier,
        params: data.orderData,
      }).unwrap();
    } catch (error) {
      console.error('Failed to calculate price:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Courier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Courier Service</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="courier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Courier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a courier service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pathao">Pathao</SelectItem>
                        <SelectItem value="steadfast">Steadfast</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the courier service to calculate delivery price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="orderData.orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter order number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderData.customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderData.customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="orderData.customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="orderData.customerCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderData.customerArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderData.customerPostCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Items</CardTitle>
              <CardDescription>Add items to calculate delivery price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 items-end">
                  <div className="col-span-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0.1)}
                      min="0.1"
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem}>
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderData.deliveryCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Charge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            calculateTotal();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateTotal()}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Items</p>
                  <p className="font-medium">{items.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Weight</p>
                  <p className="font-medium">{calculateTotalWeight().toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Value</p>
                  <p className="font-medium">৳{calculateTotalValue().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="orderData.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading} size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              {isLoading ? 'Calculating...' : 'Calculate Price'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Price Results */}
      {priceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Calculator className="h-5 w-5" />
              <span>Price Calculation Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Delivery Fee</p>
                  <p className="text-2xl font-bold text-green-600">
                    ৳{priceData.data?.deliveryFee?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Estimated Delivery Time</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {priceData.data?.estimatedDeliveryTime || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="capitalize">
                  {selectedCourier} Courier Service
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Calculation Failed</p>
                <p className="text-sm text-muted-foreground">
                  Unable to calculate price. Please check your inputs and try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
