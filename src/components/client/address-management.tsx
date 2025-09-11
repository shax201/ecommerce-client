"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";

interface Address {
  _id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [newAddress, setNewAddress] = useState<Omit<Address, "_id">>({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Bangladesh",
    phone: "",
    isDefault: false,
  });

  // Fetch addresses from backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping`)
      .then((res) => res.json())
      .then((data) => setAddresses(data.data || []))
      .catch((err) => console.error("Error fetching addresses:", err));
  }, []);

  // Add new address
  const handleAddAddress = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddress),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data.data]);
        setIsAddingAddress(false);
        setNewAddress({
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "Bangladesh",
          phone: "",
          isDefault: false,
        });
      }
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  // Update address
  const handleUpdateAddress = async () => {
    if (!editingAddress) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping/${editingAddress._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingAddress),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddress._id ? data.data : addr
          )
        );
        setEditingAddress(null);
      }
    } catch (err) {
      console.error("Error updating address:", err);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping/${id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  // Set default
  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping/${id}/default`,
        {
          method: "PATCH",
        }
      );
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((addr) => ({ ...addr, isDefault: addr._id === id }))
        );
      }
    } catch (err) {
      console.error("Error setting default:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Addresses
              </CardTitle>
              <CardDescription>
                Manage your delivery addresses for faster checkout
              </CardDescription>
            </div>
            <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Street Address</Label>
                    <Input
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>ZIP</Label>
                    <Input
                      value={newAddress.zip}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          zip: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Checkbox
                      checked={newAddress.isDefault}
                      onCheckedChange={(checked) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          isDefault: !!checked,
                        }))
                      }
                    />
                    <Label>Set as default</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingAddress(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddAddress}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address._id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{address.address}</h3>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.zip}
                  </p>
                </div>
                {address.isDefault && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Default
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p>{address.country}</p>
                <p className="text-muted-foreground">{address.phone}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Dialog
                    open={
                      !!editingAddress && editingAddress._id === address._id
                    }
                    onOpenChange={(open) => !open && setEditingAddress(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAddress(address)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Street Address</Label>
                          <Input
                            value={editingAddress?.address || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev
                                  ? { ...prev, address: e.target.value }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input
                            value={editingAddress?.city || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev ? { ...prev, city: e.target.value } : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input
                            value={editingAddress?.state || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev ? { ...prev, state: e.target.value } : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>ZIP</Label>
                          <Input
                            value={editingAddress?.zip || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev ? { ...prev, zip: e.target.value } : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={editingAddress?.country || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev
                                  ? { ...prev, country: e.target.value }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={editingAddress?.phone || ""}
                            onChange={(e) =>
                              setEditingAddress((prev) =>
                                prev ? { ...prev, phone: e.target.value } : null
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Checkbox
                            checked={editingAddress?.isDefault || false}
                            onCheckedChange={(checked) =>
                              setEditingAddress((prev) =>
                                prev ? { ...prev, isDefault: !!checked } : null
                              )
                            }
                          />
                          <Label>Set as default</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setEditingAddress(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateAddress}>Update</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address._id)}
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
