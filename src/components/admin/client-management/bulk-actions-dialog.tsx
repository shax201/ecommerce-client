"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useBulkUpdateClientStatusMutation
} from "@/lib/features/clients";
import { toast } from "sonner";
import { Loader2, AlertTriangle, UserCheck, UserX } from "lucide-react";

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClients: string[];
  onSuccess: () => void;
}

export function BulkActionsDialog({ 
  open, 
  onOpenChange, 
  selectedClients, 
  onSuccess 
}: BulkActionsDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [bulkUpdateStatus, { isLoading: isUpdatingStatus }] = useBulkUpdateClientStatusMutation();

  const [action, setAction] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleActionChange = (value: string) => {
    setAction(value);
    if (value === "changeStatus") {
      setStatus("active");
    }
  };

  const handleSubmit = async () => {
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    if (action === "changeStatus" && !status) {
      toast.error("Please select a status");
      return;
    }

    setIsLoading(true);

    try {
      let result;

      switch (action) {
        case "activate":
          result = await bulkUpdateStatus({ 
            ids: selectedClients, 
            status: true 
          }).unwrap();
          break;
        
        case "deactivate":
          result = await bulkUpdateStatus({ 
            ids: selectedClients, 
            status: false 
          }).unwrap();
          break;
        
        case "changeStatus":
          result = await bulkUpdateStatus({ 
            ids: selectedClients, 
            status: status === "active" 
          }).unwrap();
          break;
        
        default:
          throw new Error("Invalid action");
      }

      if (result.success) {
        toast.success(`Bulk action completed successfully`);
        onSuccess();
        onOpenChange(false);
        setAction("");
        setStatus("");
      } else {
        toast.error(result.message || "Bulk action failed");
      }
    } catch (error: any) {
      console.error("Bulk action error:", error);
      toast.error(error.data?.message || "Bulk action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAction("");
    setStatus("");
  };

  const getActionDescription = () => {
    switch (action) {
      case "activate":
        return `This will activate ${selectedClients.length} client${selectedClients.length !== 1 ? 's' : ''}.`;
      case "deactivate":
        return `This will deactivate ${selectedClients.length} client${selectedClients.length !== 1 ? 's' : ''}.`;
      case "changeStatus":
        return `This will change the status of ${selectedClients.length} client${selectedClients.length !== 1 ? 's' : ''} to ${status}.`;
      default:
        return "";
    }
  };

  const isDestructiveAction = false;
  const isProcessing = isLoading || isUpdatingStatus;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedClients.length} selected client{selectedClients.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Action</label>
            <Select value={action} onValueChange={handleActionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Activate Clients
                  </div>
                </SelectItem>
                <SelectItem value="deactivate">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Deactivate Clients
                  </div>
                </SelectItem>
                <SelectItem value="changeStatus">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Change Status
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Selection (for changeStatus action) */}
          {action === "changeStatus" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Description */}
          {action && (
            <Alert className={isDestructiveAction ? "border-red-200 bg-red-50" : ""}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getActionDescription()}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!action || isProcessing}
            variant={isDestructiveAction ? "destructive" : "default"}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Execute Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
