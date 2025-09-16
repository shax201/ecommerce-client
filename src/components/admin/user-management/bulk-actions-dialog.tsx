"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBulkOperationMutation } from "@/lib/features/user-management";
import { clearSelection } from "@/lib/features/user-management";
import { Eye, EyeOff } from "lucide-react";

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: string[];
  onBulkAction: () => void;
}

export function BulkActionsDialog({
  open,
  onOpenChange,
  selectedUsers,
  onBulkAction,
}: BulkActionsDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [bulkOperation, { isLoading }] = useBulkOperationMutation();

  const [operation, setOperation] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleOperationChange = (value: string) => {
    setOperation(value);
    // Reset dependent fields when operation changes
    setReason("");
    setRole("");
    setStatus("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!operation) return;

    try {
      const operationData: any = {
        userIds: selectedUsers,
        operation,
      };

      // Add operation-specific data
      if (operation === "changeRole" && role) {
        operationData.data = { role };
      } else if (operation === "activate" || operation === "deactivate" || operation === "suspend") {
        operationData.data = { 
          status: operation === "activate" ? "active" : 
                  operation === "deactivate" ? "inactive" : "suspended"
        };
      }

      if (reason) {
        operationData.reason = reason;
      }

      const result = await bulkOperation(operationData).unwrap();
      
      if (result.success) {
        dispatch(clearSelection());
        onBulkAction();
        onOpenChange(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to perform bulk operation:', error);
      // Handle error - could show toast notification
    }
  };

  const resetForm = () => {
    setOperation("");
    setReason("");
    setRole("");
    setStatus("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getOperationDescription = (op: string) => {
    switch (op) {
      case "activate":
        return "Activate all selected users";
      case "deactivate":
        return "Deactivate all selected users";
      case "suspend":
        return "Suspend all selected users";
      case "delete":
        return "Permanently delete all selected users";
      case "changeRole":
        return "Change role for all selected users";
      default:
        return "";
    }
  };

  const isDestructiveOperation = (op: string) => {
    return op === "delete" || op === "suspend";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operation">Operation</Label>
            <Select value={operation} onValueChange={handleOperationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate Users</SelectItem>
                <SelectItem value="deactivate">Deactivate Users</SelectItem>
                <SelectItem value="suspend">Suspend Users</SelectItem>
                <SelectItem value="changeRole">Change Role</SelectItem>
                <SelectItem value="delete">Delete Users</SelectItem>
              </SelectContent>
            </Select>
            {operation && (
              <p className="text-sm text-muted-foreground">
                {getOperationDescription(operation)}
              </p>
            )}
          </div>

          {operation === "changeRole" && (
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(operation === "suspend" || operation === "deactivate" || operation === "delete") && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this action..."
                rows={3}
              />
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Selected Users:</h4>
            <p className="text-sm text-muted-foreground">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} will be affected by this operation.
            </p>
          </div>

          {isDestructiveOperation(operation) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 text-sm mb-1">Warning</h4>
              <p className="text-red-700 text-sm">
                This is a destructive operation that cannot be undone. Please proceed with caution.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !operation || (operation === "changeRole" && !role)}
              variant={isDestructiveOperation(operation) ? "destructive" : "default"}
            >
              {isLoading ? "Processing..." : `Execute ${operation}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}