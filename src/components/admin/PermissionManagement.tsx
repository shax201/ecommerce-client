"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Shield, Users, Key } from 'lucide-react';
import { PageLoading } from '@/components/ui/loading-spinner';
import {
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetCurrentUserPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
  useGetUserRolesQuery,
} from '@/lib/features/permissions/permissionApi';
import { PermissionResource, PermissionAction } from '@/types/permission.types';

export default function PermissionManagement() {
  const [activeTab, setActiveTab] = useState('permissions');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Debug: Check token availability
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userToken = localStorage.getItem('user-token');
      const adminToken = localStorage.getItem('admin-token');
      console.log('PermissionManagement Debug:', {
        userToken: userToken ? `${userToken.substring(0, 20)}...` : 'Not found',
        adminToken: adminToken ? `${adminToken.substring(0, 20)}...` : 'Not found',
        hasUserToken: !!userToken,
        hasAdminToken: !!adminToken
      });
    }
  }, []);

  // API hooks
  const { data: permissions, isLoading: permissionsLoading, refetch: refetchPermissions, error: permissionsError } = useGetPermissionsQuery();
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles, error: rolesError } = useGetRolesQuery();
  const { data: currentUserPermissions, isLoading: currentUserLoading, error: currentUserError } = useGetCurrentUserPermissionsQuery();

  // Mutations
  const [createPermission, { isLoading: creatingPermission }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: updatingPermission }] = useUpdatePermissionMutation();
  const [deletePermission, { isLoading: deletingPermission }] = useDeletePermissionMutation();
  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deletingRole }] = useDeleteRoleMutation();
  const [assignRole, { isLoading: assigningRole }] = useAssignRoleToUserMutation();

  // Form states
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    resource: '' as PermissionResource,
    action: '' as PermissionAction,
    description: ''
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [userRoleForm, setUserRoleForm] = useState({
    userId: '',
    roleId: ''
  });

  // Confirmation modal states
  const [deletePermissionModal, setDeletePermissionModal] = useState({
    isOpen: false,
    permissionId: '',
    permissionName: ''
  });

  const [deleteRoleModal, setDeleteRoleModal] = useState({
    isOpen: false,
    roleId: '',
    roleName: ''
  });

  // Create/Update permission modal states
  const [createPermissionModal, setCreatePermissionModal] = useState({
    isOpen: false,
    error: ''
  });

  const [updatePermissionModal, setUpdatePermissionModal] = useState({
    isOpen: false,
    permission: null as any,
    error: ''
  });


  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole(roleForm).unwrap();
      setRoleForm({ name: '', description: '', permissions: [] });
      refetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignRole(userRoleForm).unwrap();
      setUserRoleForm({ userId: '', roleId: '' });
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const togglePermissionInRole = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Confirmation modal handlers
  const openDeletePermissionModal = (permissionId: string, permissionName: string) => {
    setDeletePermissionModal({
      isOpen: true,
      permissionId,
      permissionName
    });
  };

  const openDeleteRoleModal = (roleId: string, roleName: string) => {
    setDeleteRoleModal({
      isOpen: true,
      roleId,
      roleName
    });
  };

  const handleConfirmDeletePermission = async () => {
    try {
      await deletePermission(deletePermissionModal.permissionId).unwrap();
      setDeletePermissionModal({ isOpen: false, permissionId: '', permissionName: '' });
      refetchPermissions();
    } catch (error) {
      console.error('Failed to delete permission:', error);
    }
  };

  const handleConfirmDeleteRole = async () => {
    try {
      await deleteRole(deleteRoleModal.roleId).unwrap();
      setDeleteRoleModal({ isOpen: false, roleId: '', roleName: '' });
      refetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  // Create/Update permission modal handlers
  const openCreatePermissionModal = () => {
    setPermissionForm({ name: '', resource: '' as PermissionResource, action: '' as PermissionAction, description: '' });
    setCreatePermissionModal({ isOpen: true, error: '' });
  };

  const openUpdatePermissionModal = (permission: any) => {
    setPermissionForm({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description
    });
    setUpdatePermissionModal({ isOpen: true, permission, error: '' });
  };

  const handleCreatePermissionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPermission(permissionForm).unwrap();
      setPermissionForm({ name: '', resource: '' as PermissionResource, action: '' as PermissionAction, description: '' });
      setCreatePermissionModal({ isOpen: false, error: '' });
      refetchPermissions();
    } catch (error: any) {
      console.error('Failed to create permission:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create permission';
      setCreatePermissionModal(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const handleUpdatePermissionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePermission({ 
        id: updatePermissionModal.permission._id, 
        data: permissionForm 
      }).unwrap();
      setPermissionForm({ name: '', resource: '' as PermissionResource, action: '' as PermissionAction, description: '' });
      setUpdatePermissionModal({ isOpen: false, permission: null, error: '' });
      refetchPermissions();
    } catch (error: any) {
      console.error('Failed to update permission:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update permission';
      setUpdatePermissionModal(prev => ({ ...prev, error: errorMessage }));
    }
  };

  if (permissionsLoading || rolesLoading || currentUserLoading) {
    return <PageLoading text="Loading permissions..." />;
  }

  // Show errors if any
  if (permissionsError || rolesError || currentUserError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Permissions</h2>
          <div className="space-y-2">
            {permissionsError && (
              <p className="text-gray-600">Permissions Error: {(permissionsError as any)?.data?.message || 'Unknown error'}</p>
            )}
            {rolesError && (
              <p className="text-gray-600">Roles Error: {(rolesError as any)?.data?.message || 'Unknown error'}</p>
            )}
            {currentUserError && (
              <p className="text-gray-600">Current User Error: {(currentUserError as any)?.data?.message || 'Unknown error'}</p>
            )}
          </div>
          <Button 
            onClick={() => {
              refetchPermissions();
              refetchRoles();
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Permission Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="my-permissions">My Permissions</TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Permissions</h3>
              <p className="text-sm text-muted-foreground">Manage system permissions</p>
            </div>
            <Button onClick={openCreatePermissionModal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Permission
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                Manage system permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(permissions) && permissions.length > 0 ? permissions.map((permission) => (
                    <TableRow key={permission._id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdatePermissionModal(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDeletePermissionModal(permission._id, permission.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {Array.isArray(permissions) ? 'No permissions found' : 'Loading permissions...'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create New Role
              </CardTitle>
              <CardDescription>
                Create a new role with specific permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Manager"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Can manage products and orders"
                    />
                  </div>
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {Array.isArray(permissions) && permissions.length > 0 ? permissions.map((permission) => (
                      <div key={permission._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission._id}
                          checked={roleForm.permissions.includes(permission._id)}
                          onCheckedChange={() => togglePermissionInRole(permission._id)}
                        />
                        <Label htmlFor={permission._id} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    )) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        {Array.isArray(permissions) ? 'No permissions available' : 'Loading permissions...'}
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={creatingRole}>
                  {creatingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Role
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
              <CardDescription>
                Manage system roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(roles) && roles.length > 0 ? roles.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role.permissions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDeleteRoleModal(role._id, role.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {Array.isArray(roles) ? 'No roles found' : 'Loading roles...'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assign Role to User
              </CardTitle>
              <CardDescription>
                Assign roles to specific users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-id">User ID</Label>
                    <Input
                      id="user-id"
                      value={userRoleForm.userId}
                      onChange={(e) => setUserRoleForm(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-id">Role</Label>
                    <Select
                      value={userRoleForm.roleId}
                      onValueChange={(value) => setUserRoleForm(prev => ({ ...prev, roleId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(roles) && roles.length > 0 ? roles.map((role) => (
                          <SelectItem key={role._id} value={role._id}>
                            {role.name}
                          </SelectItem>
                        )) : (
                          <SelectItem value="" disabled>
                            {Array.isArray(roles) ? 'No roles available' : 'Loading roles...'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={assigningRole}>
                  {assigningRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Assign Role
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Permissions Tab */}
        <TabsContent value="my-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Current Permissions</CardTitle>
              <CardDescription>
                Permissions assigned to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(currentUserPermissions) && currentUserPermissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUserPermissions.map((permission) => (
                    <div key={permission._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{permission.name}</h3>
                        <Badge variant="outline">{permission.action}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                      <Badge variant="secondary" className="mt-2">{permission.resource}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No permissions assigned to your account.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Permission Modal */}
      <Dialog open={createPermissionModal.isOpen} onOpenChange={(open) => 
        setCreatePermissionModal({ isOpen: open, error: '' })
      }>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Create New Permission
            </DialogTitle>
            <DialogDescription>
              Create a new permission for the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePermissionModal} className="space-y-4">
            {createPermissionModal.error && (
              <Alert variant="destructive">
                <AlertDescription>{createPermissionModal.error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modal-permission-name">Permission Name</Label>
                <Input
                  id="modal-permission-name"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Create Users"
                  required
                />
              </div>
              <div>
                <Label htmlFor="modal-permission-description">Description</Label>
                <Input
                  id="modal-permission-description"
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Allow creating new users"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modal-permission-resource">Resource</Label>
                <Select
                  value={permissionForm.resource}
                  onValueChange={(value) => setPermissionForm(prev => ({ ...prev, resource: value as PermissionResource }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="coupons">Coupons</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="company-settings">Company Settings</SelectItem>
                    <SelectItem value="shipping-addresses">Shipping Addresses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modal-permission-action">Action</Label>
                <Select
                  value={permissionForm.action}
                  onValueChange={(value) => setPermissionForm(prev => ({ ...prev, action: value as PermissionAction }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreatePermissionModal({ isOpen: false, error: '' })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingPermission}>
                {creatingPermission ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Permission
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Permission Modal */}
      <Dialog open={updatePermissionModal.isOpen} onOpenChange={(open) => 
        setUpdatePermissionModal(prev => ({ ...prev, isOpen: open, error: '' }))
      }>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Update Permission
            </DialogTitle>
            <DialogDescription>
              Update the permission details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePermissionModal} className="space-y-4">
            {updatePermissionModal.error && (
              <Alert variant="destructive">
                <AlertDescription>{updatePermissionModal.error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="update-permission-name">Permission Name</Label>
                <Input
                  id="update-permission-name"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Create Users"
                  required
                />
              </div>
              <div>
                <Label htmlFor="update-permission-description">Description</Label>
                <Input
                  id="update-permission-description"
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Allow creating new users"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="update-permission-resource">Resource</Label>
                <Select
                  value={permissionForm.resource}
                  onValueChange={(value) => setPermissionForm(prev => ({ ...prev, resource: value as PermissionResource }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="coupons">Coupons</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="company-settings">Company Settings</SelectItem>
                    <SelectItem value="shipping-addresses">Shipping Addresses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="update-permission-action">Action</Label>
                <Select
                  value={permissionForm.action}
                  onValueChange={(value) => setPermissionForm(prev => ({ ...prev, action: value as PermissionAction }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUpdatePermissionModal({ isOpen: false, permission: null, error: '' })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingPermission}>
                {updatingPermission ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Permission
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Confirmation Modal */}
      <Dialog open={deletePermissionModal.isOpen} onOpenChange={(open) => 
        setDeletePermissionModal(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the permission "{deletePermissionModal.permissionName}"? 
              This action cannot be undone and may affect users who have this permission assigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeletePermissionModal({ isOpen: false, permissionId: '', permissionName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeletePermission}
              disabled={deletingPermission}
            >
              {deletingPermission ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Modal */}
      <Dialog open={deleteRoleModal.isOpen} onOpenChange={(open) => 
        setDeleteRoleModal(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{deleteRoleModal.roleName}"? 
              This action cannot be undone and will remove this role from all users who have it assigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteRoleModal({ isOpen: false, roleId: '', roleName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteRole}
              disabled={deletingRole}
            >
              {deletingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}