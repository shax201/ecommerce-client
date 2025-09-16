"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/lib/services/user-management-service";
import { useUpdateUserStatusMutation } from "@/lib/features/user-management";
import { toast } from "sonner";

const statusUpdateSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]),
  reason: z.string().optional(),
});

type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;

interface UserStatusDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserStatusDialogProps) {
  const [updateUserStatus, { isLoading: loading }] = useUpdateUserStatusMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StatusUpdateForm>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: user.status,
      reason: "",
    },
  });

  const onSubmit = async (data: StatusUpdateForm) => {
    try {
      const result = await updateUserStatus({ 
        id: user._id, 
        status: data.status, 
        reason: data.reason 
      }).unwrap();
      
      toast.success("User status updated successfully");
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user status");
      console.error("Error updating user status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-yellow-600";
      case "suspended":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "active":
        return "User can log in and access all features";
      case "inactive":
        return "User cannot log in but account is preserved";
      case "suspended":
        return "User account is temporarily disabled";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Status</DialogTitle>
          <DialogDescription>
            Change the status for <strong>{user.firstName} {user.lastName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as "active" | "inactive" | "suspended")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Inactive
                  </div>
                </SelectItem>
                <SelectItem value="suspended">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Suspended
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className={`text-sm mt-1 ${getStatusColor(watch("status"))}`}>
              {getStatusDescription(watch("status"))}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for status change..."
              {...register("reason")}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be recorded in the user's activity log
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
