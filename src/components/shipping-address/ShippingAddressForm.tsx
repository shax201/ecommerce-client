"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import {
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  CreateShippingAddressData,
  UpdateShippingAddressData,
  ShippingAddress,
} from "@/lib/features/shipping-address";

interface ShippingAddressFormProps {
  address?: ShippingAddress | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ShippingAddressForm({ address, onClose, onSuccess }: ShippingAddressFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  const [createAddress, { isLoading: isCreating }] = useCreateShippingAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateShippingAddressMutation();

  const isEditing = !!address;
  const isLoading = isCreating || isUpdating;

  // Populate form with existing address data
  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        address: address.address,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && address) {
        const updateData: UpdateShippingAddressData = {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
          isDefault: formData.isDefault,
        };

        await updateAddress({ id: address._id, data: updateData }).unwrap();
        console.log('✅ [Address Form] Address updated successfully');
      } else {
        const createData: CreateShippingAddressData = {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
          isDefault: formData.isDefault,
        };

        await createAddress(createData).unwrap();
        console.log('✅ [Address Form] Address created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ [Address Form] Failed to save address:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="10001"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isDefault: !!checked }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="isDefault">Set as default address</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Address' : 'Create Address')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
