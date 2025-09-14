"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import {
  useGetShippingAddressesQuery,
  useGetDefaultShippingAddressQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
  useSetDefaultShippingAddressMutation,
  CreateShippingAddressData,
  UpdateShippingAddressData,
  ShippingAddress,
} from "@/lib/features/shipping-address";
import { ShippingAddressForm } from "./ShippingAddressForm";

interface ShippingAddressManagerProps {
  userId?: string;
}

export function ShippingAddressManager({ userId }: ShippingAddressManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  // Redux queries
  const { 
    data: addressesData, 
    isLoading: isLoadingAddresses, 
    error: addressesError,
    refetch: refetchAddresses 
  } = useGetShippingAddressesQuery({ userId });

  const { 
    data: defaultAddressData, 
    isLoading: isLoadingDefault 
  } = useGetDefaultShippingAddressQuery({ userId }, {
    skip: !userId
  });

  // Redux mutations
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateShippingAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateShippingAddressMutation();
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteShippingAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultShippingAddressMutation();

  const addresses = addressesData?.data || [];
  const defaultAddress = defaultAddressData?.data;

  const handleCreateSuccess = () => {
    setIsCreating(false);
    refetchAddresses();
  };

  const handleEditSuccess = () => {
    setEditingAddress(null);
    refetchAddresses();
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id).unwrap();
      refetchAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id).unwrap();
      refetchAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (isLoadingAddresses) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  if (addressesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading addresses. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shipping Addresses</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No shipping addresses found.</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsCreating(true)}
            >
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card key={address._id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {address.name}
                      {address.isDefault && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                        disabled={isSettingDefault}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAddress(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(address._id)}
                      disabled={isDeletingAddress}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {address.address}, {address.city}, {address.state} {address.zip}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <p>Total Addresses: {addresses.length}</p>
          <p>Default Address: {defaultAddress ? defaultAddress.name : "None"}</p>
          <p>User ID: {userId || "Not provided"}</p>
        </CardContent>
      </Card>

      {/* Create/Edit Forms */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ShippingAddressForm
            onClose={() => setIsCreating(false)}
            onSuccess={handleCreateSuccess}
          />
        </div>
      )}

      {editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ShippingAddressForm
            address={editingAddress}
            onClose={() => setEditingAddress(null)}
            onSuccess={handleEditSuccess}
          />
        </div>
      )}
    </div>
  );
}
