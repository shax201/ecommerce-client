"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch } from "@/lib/store";
import { useCreateOrderWithCourierMutation } from "@/lib/features/courier";
import { useGetOrdersByStatusQuery } from "@/lib/features/orders/ordersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CourierType } from "@/types/courier.types";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const orderFormSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  courier: z.enum(['pathao', 'steadfast'], {
    message: "Please select a courier service",
  }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function CourierOrderForm() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [createOrderWithCourier, { isLoading }] = useCreateOrderWithCourierMutation();

  // Fetch orders with 'pending' or 'processing' status
  const { data: ordersData, isLoading: isOrdersLoading } = useGetOrdersByStatusQuery(['pending', 'processing']);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderId: '',
      courier: 'steadfast',
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    // Prevent submission if invalid order is selected
    if (data.orderId === 'loading' || data.orderId === 'no-orders') {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid order",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createOrderWithCourier({
        orderId: data.orderId,
        courier: data.courier,
      }).unwrap();
      
      if (result.success) {
        toast({
          title: "Order Created",
          description: result.message || "Courier order created successfully",
          variant: "success",
        });
        
        // Reset form
        form.reset();
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create courier order",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Create Courier Order</CardTitle>
            <CardDescription>
              Select an existing order and courier service to create courier delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Order</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isOrdersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading orders...
                          </SelectItem>
                        ) : ordersData?.data && ordersData.data.length > 0 ? (
                          ordersData.data.map((order) => (
                            <SelectItem key={order._id} value={order._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">#{order.orderNumber}</span>
                                <span className="text-sm text-muted-foreground">
                                  {order.clientID.name} - ৳{order.totalPrice}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  Status: {order.status}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-orders" disabled>
                            No orders available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select an order with 'pending' or 'processing' status
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courier Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select courier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pathao">Pathao</SelectItem>
                        <SelectItem value="steadfast">Steadfast</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the courier service for delivery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}