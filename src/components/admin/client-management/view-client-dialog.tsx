"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Client } from "@/lib/services/client-management-service";
import { ClientData } from "@/app/admin/clients/client.interface";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  X
} from "lucide-react";

interface ViewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function ViewClientDialog({ open, onOpenChange, client }: ViewClientDialogProps) {
  if (!client) return null;

  const formatAddress = (address: any) => {
    if (typeof address === 'string') {
      return address || 'Not provided';
    }
    
    if (address && typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
      ].filter(Boolean);
      
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    
    return 'Not provided';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Client Details</DialogTitle>
              <DialogDescription>
                View detailed information about this client
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
            {client.image ? (
              <img
                src={client.image}
                alt={`${client.firstName} ${client.lastName}`}
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {client.firstName} {client.lastName}
              </h3>
              <p className="text-sm text-gray-500">Client ID: {client._id}</p>
              <div className="mt-2">
                <Badge variant={client.status ? 'default' : 'secondary'}>
                  {client.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-sm">{client.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {client.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Full Address</label>
              <p className="text-sm">{formatAddress(client.address)}</p>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <div>
                  <Badge variant={client.status ? 'default' : 'secondary'}>
                    {client.status ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {client.createdAt 
                    ? format(new Date(client.createdAt), 'MMM dd, yyyy') 
                    : 'Not available'
                  }
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Timestamps</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">
                  {client.createdAt 
                    ? format(new Date(client.createdAt), 'MMM dd, yyyy HH:mm') 
                    : 'Not available'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">
                  {client.updatedAt 
                    ? format(new Date(client.updatedAt), 'MMM dd, yyyy HH:mm') 
                    : 'Not available'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
