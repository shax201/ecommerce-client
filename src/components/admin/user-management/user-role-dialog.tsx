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
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/services/user-management-service";
import { useUpdateUserRoleMutation } from "@/lib/features/user-management";
import { toast } from "sonner";

const roleUpdateSchema = z.object({
  role: z.enum(["admin", "client"]),
  permissions: z.array(z.string()).optional(),
});

type RoleUpdateForm = z.infer<typeof roleUpdateSchema>;

interface UserRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const availablePermissions = [
  { id: "users.create", name: "Create Users", description: "Create new user accounts" },
  { id: "users.read", name: "View Users", description: "View user information" },
  { id: "users.update", name: "Update Users", description: "Edit user information" },
  { id: "users.delete", name: "Delete Users", description: "Delete user accounts" },
  { id: "products.create", name: "Create Products", description: "Add new products" },
  { id: "products.read", name: "View Products", description: "View product information" },
  { id: "products.update", name: "Update Products", description: "Edit product information" },
  { id: "products.delete", name: "Delete Products", description: "Delete products" },
  { id: "orders.read", name: "View Orders", description: "View order information" },
  { id: "orders.update", name: "Update Orders", description: "Update order status" },
  { id: "reports.read", name: "View Reports", description: "Access reports and analytics" },
  { id: "settings.update", name: "Update Settings", description: "Modify system settings" },
];

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserRoleDialogProps) {
  const [updateUserRole, { isLoading: loading }] = useUpdateUserRoleMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RoleUpdateForm>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      role: user.role,
      permissions: user.permissions || [],
    },
  });

  const selectedPermissions = watch("permissions") || [];
  const selectedRole = watch("role");

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = selectedPermissions;
    if (checked) {
      setValue("permissions", [...currentPermissions, permissionId]);
    } else {
      setValue("permissions", currentPermissions.filter(p => p !== permissionId));
    }
  };

  const onSubmit = async (data: RoleUpdateForm) => {
    try {
      const result = await updateUserRole({ 
        id: user._id, 
        role: data.role, 
        permissions: data.permissions 
      }).unwrap();
      
      toast.success("User role updated successfully");
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user role");
      console.error("Error updating user role:", error);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to all system features and user management";
      case "client":
        return "Limited access to client-specific features";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for <strong>{user.firstName} {user.lastName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as "admin" | "client")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Client
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {getRoleDescription(selectedRole)}
            </p>
          </div>

          {selectedRole === "admin" && (
            <div>
              <Label>Permissions</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select specific permissions for this admin user
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.id, checked as boolean)
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
