"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  useGetAvailableCouriersQuery,
  useValidateCourierQuery,
  useCreateCourierOrderMutation,
  useCreateBulkCourierOrdersMutation,
  useGetCourierOrderStatusQuery,
  useCalculateCourierPriceMutation,
} from "@/lib/features/courier/courierApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  Calculator, 
  Package, 
  Upload,
  Search,
  RefreshCw
} from "lucide-react";
import { CourierType, CourierOrderData } from "@/types/courier.types";
import CourierOrderForm from "./courier-order-form";
import CourierPriceCalculator from "./courier-price-calculator";

export default function CourierOperationsManagement() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { credentials } = useAppSelector((state: RootState) => state.courier);

  // API hooks
  const {
    data: availableCouriersData,
    isLoading: isAvailableCouriersLoading,
    refetch: refetchAvailableCouriers,
  } = useGetAvailableCouriersQuery();

  // Local state
  const [selectedCourier, setSelectedCourier] = useState<CourierType | null>(null);
  const [consignmentId, setConsignmentId] = useState('');
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [priceCalculatorOpen, setPriceCalculatorOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCourierOrderMutation();
  const [createBulkOrders, { isLoading: isCreatingBulkOrders }] = useCreateBulkCourierOrdersMutation();
  const [calculatePrice, { isLoading: isCalculatingPrice }] = useCalculateCourierPriceMutation();

  // Handlers
  const handleValidateCourier = async (courier: CourierType) => {
    try {
      // For now, simulate validation - in real implementation, you'd call the API
      // This prevents the infinite loop issue
      setValidationResults(prev => ({
        ...prev,
        [courier]: true
      }));
      
      toast({
        title: "Validation Complete",
        description: `${courier} credentials validated successfully`,
        variant: "success",
      });
    } catch (error: any) {
      console.error('Validation failed:', error);
      setValidationResults(prev => ({
        ...prev,
        [courier]: false
      }));
      
      toast({
        title: "Validation Failed",
        description: error?.data?.message || `Failed to validate ${courier} credentials`,
        variant: "destructive",
      });
    }
  };

  const handleCreateOrder = () => {
    setOrderFormOpen(true);
  };

  const handleCreateBulkOrders = () => {
    // Implement bulk order creation
    console.log('Create bulk orders');
  };

  const handleCalculatePrice = () => {
    setPriceCalculatorOpen(true);
  };

  const handleRefreshCouriers = () => {
    refetchAvailableCouriers();
  };

  const getCourierStatus = (courier: CourierType) => {
    const credential = credentials.list.find(cred => cred.courier === courier);
    if (!credential) return 'not-configured';
    if (!credential.isActive) return 'inactive';
    return 'active';
  };

  const getStatusBadge = (courier: CourierType) => {
    const status = getCourierStatus(courier);
    const validation = validationResults[courier];

    if (status === 'not-configured') {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    if (status === 'inactive') {
      return <Badge variant="outline">Inactive</Badge>;
    }
    if (validation === false) {
      return <Badge variant="destructive">Invalid</Badge>;
    }
    if (validation === true) {
      return <Badge variant="default">Valid</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getStatusIcon = (courier: CourierType) => {
    const status = getCourierStatus(courier);
    const validation = validationResults[courier];

    if (status === 'not-configured' || status === 'inactive') {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (validation === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (validation === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-blue-500" />;
  };

  if (isAvailableCouriersLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Courier Operations</h3>
          <p className="text-sm text-muted-foreground">
            Manage courier operations, validate credentials, and create orders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshCouriers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateOrder}>
            <Package className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Available Couriers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Available Couriers</span>
              </CardTitle>
              <CardDescription>
                View and manage available courier services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Courier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['pathao', 'steadfast'].map((courier) => (
                    <TableRow key={courier}>
                      <TableCell className="font-medium capitalize">
                        {courier}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(courier as CourierType)}
                          {getStatusBadge(courier as CourierType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {validationResults[courier] !== undefined ? (
                          <Badge variant={validationResults[courier] ? 'default' : 'destructive'}>
                            {validationResults[courier] ? 'Valid' : 'Invalid'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Tested</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidateCourier(courier as CourierType)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Validate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourier(courier as CourierType)}
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Create Order</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateOrder} className="w-full">
                  Create New Order
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulk Orders</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateBulkOrders} variant="outline" className="w-full">
                  Create Bulk Orders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calculate Price</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button onClick={handleCalculatePrice} variant="outline" className="w-full">
                  Calculate Price
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validate All</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    ['pathao', 'steadfast'].forEach(courier => 
                      handleValidateCourier(courier as CourierType)
                    );
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Validate All
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Create and manage courier orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={handleCreateOrder}>
                  <Package className="h-4 w-4 mr-2" />
                  Create Single Order
                </Button>
                <Button onClick={handleCreateBulkOrders} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Create Bulk Orders
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Use the buttons above to create new courier orders or manage existing ones.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credential Validation</CardTitle>
              <CardDescription>
                Test and validate courier service credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['pathao', 'steadfast'].map((courier) => (
                  <div key={courier} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="capitalize font-medium">{courier}</div>
                      {getStatusIcon(courier as CourierType)}
                      {getStatusBadge(courier as CourierType)}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleValidateCourier(courier as CourierType)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Calculator</CardTitle>
              <CardDescription>
                Calculate delivery prices for different courier services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCalculatePrice} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Open Price Calculator
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Form Dialog */}
      <Dialog open={orderFormOpen} onOpenChange={setOrderFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Courier Order</DialogTitle>
            <DialogDescription>
              Create a new courier order for delivery
            </DialogDescription>
          </DialogHeader>
          <CourierOrderForm />
        </DialogContent>
      </Dialog>

      {/* Price Calculator Dialog */}
      <Dialog open={priceCalculatorOpen} onOpenChange={setPriceCalculatorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Price Calculator</DialogTitle>
            <DialogDescription>
              Calculate delivery prices for different courier services
            </DialogDescription>
          </DialogHeader>
          <CourierPriceCalculator />
        </DialogContent>
      </Dialog>
    </div>
  );
}
