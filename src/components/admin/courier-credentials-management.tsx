'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, TestTube, CheckCircle, XCircle, Settings } from 'lucide-react';
import { 
  getCourierProviders, 
  getClientCredentials, 
  saveCourierCredentials, 
  testCourierCredentials,
  updateCourierCredentials,
  deleteCourierCredentials,
  toggleCredentialStatus,
  CourierProvider,
  CourierCredentials
} from '@/actions/courier-credentials';

interface CourierCredentialsManagementProps {
  clientId: string;
}

export function CourierCredentialsManagement({ clientId }: CourierCredentialsManagementProps) {
  const [providers, setProviders] = useState<CourierProvider[]>([]);
  const [credentials, setCredentials] = useState<CourierCredentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<CourierCredentials | null>(null);
  const [testingCredentials, setTestingCredentials] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    providerId: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    apiKey: '',
    autoBooking: false,
    preferredDeliveryType: 'standard',
    maxWeight: 10,
    maxValue: 10000,
    allowedCities: [] as string[],
    excludedCities: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersRes, credentialsRes] = await Promise.all([
        getCourierProviders(),
        getClientCredentials(clientId)
      ]);

      if (providersRes.success) {
        setProviders(providersRes.data || []);
      }

      if (credentialsRes.success) {
        setCredentials(credentialsRes.data || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    try {
      const credentialsData = {
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        username: formData.username,
        password: formData.password,
        apiKey: formData.apiKey
      };

      const settingsData = {
        autoBooking: formData.autoBooking,
        preferredDeliveryType: formData.preferredDeliveryType,
        maxWeight: formData.maxWeight,
        maxValue: formData.maxValue,
        allowedCities: formData.allowedCities,
        excludedCities: formData.excludedCities
      };

      const response = await saveCourierCredentials(
        clientId,
        formData.providerId,
        credentialsData,
        settingsData
      );

      if (response.success) {
        setIsAddDialogOpen(false);
        resetForm();
        loadData();
      } else {
        setError(response.error?.message || 'Failed to save credentials');
      }
    } catch (err) {
      setError('Failed to save credentials');
    }
  };

  const handleUpdateCredentials = async () => {
    if (!editingCredential) return;

    try {
      const credentialsData = {
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        username: formData.username,
        password: formData.password,
        apiKey: formData.apiKey
      };

      const settingsData = {
        autoBooking: formData.autoBooking,
        preferredDeliveryType: formData.preferredDeliveryType,
        maxWeight: formData.maxWeight,
        maxValue: formData.maxValue,
        allowedCities: formData.allowedCities,
        excludedCities: formData.excludedCities
      };

      const response = await updateCourierCredentials(
        editingCredential._id,
        credentialsData,
        settingsData
      );

      if (response.success) {
        setIsEditDialogOpen(false);
        setEditingCredential(null);
        resetForm();
        loadData();
      } else {
        setError(response.error?.message || 'Failed to update credentials');
      }
    } catch (err) {
      setError('Failed to update credentials');
    }
  };

  const handleTestCredentials = async (credential: CourierCredentials) => {
    try {
      setTestingCredentials(credential._id);
      const response = await testCourierCredentials(
        credential.courierProviderId.code,
        credential.credentials
      );

      if (response.success) {
        // Show success message
        console.log('Credentials test successful:', response.data);
      } else {
        setError(response.error?.message || 'Credentials test failed');
      }
    } catch (err) {
      setError('Failed to test credentials');
    } finally {
      setTestingCredentials(null);
    }
  };

  const handleDeleteCredentials = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete these credentials?')) return;

    try {
      const response = await deleteCourierCredentials(credentialId);
      if (response.success) {
        loadData();
      } else {
        setError(response.error?.message || 'Failed to delete credentials');
      }
    } catch (err) {
      setError('Failed to delete credentials');
    }
  };

  const handleToggleStatus = async (credentialId: string, isActive: boolean) => {
    try {
      const response = await toggleCredentialStatus(credentialId, isActive);
      if (response.success) {
        loadData();
      } else {
        setError(response.error?.message || 'Failed to toggle status');
      }
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      providerId: '',
      clientId: '',
      clientSecret: '',
      username: '',
      password: '',
      apiKey: '',
      autoBooking: false,
      preferredDeliveryType: 'standard',
      maxWeight: 10,
      maxValue: 10000,
      allowedCities: [],
      excludedCities: []
    });
  };

  const openEditDialog = (credential: CourierCredentials) => {
    setEditingCredential(credential);
    setFormData({
      providerId: credential.courierProviderId._id,
      clientId: credential.credentials.clientId,
      clientSecret: credential.credentials.clientSecret,
      username: credential.credentials.username || '',
      password: credential.credentials.password || '',
      apiKey: credential.credentials.apiKey || '',
      autoBooking: credential.settings.autoBooking,
      preferredDeliveryType: credential.settings.preferredDeliveryType,
      maxWeight: credential.settings.maxWeight,
      maxValue: credential.settings.maxValue,
      allowedCities: credential.settings.allowedCities,
      excludedCities: credential.settings.excludedCities
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Courier Credentials Management</h2>
          <p className="text-muted-foreground">Manage courier service credentials for this client</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credentials
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Courier Credentials</DialogTitle>
              <DialogDescription>
                Add new courier service credentials for this client
              </DialogDescription>
            </DialogHeader>
            <CredentialsForm
              formData={formData}
              setFormData={setFormData}
              providers={providers}
              onSubmit={handleSaveCredentials}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {credentials.map((credential) => (
          <Card key={credential._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{credential.courierProviderId.displayName}</CardTitle>
                  <Badge variant={credential.isActive ? 'default' : 'secondary'}>
                    {credential.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {credential.isDefault && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={credential.isActive}
                    onCheckedChange={(checked) => handleToggleStatus(credential._id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestCredentials(credential)}
                    disabled={testingCredentials === credential._id}
                  >
                    {testingCredentials === credential._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(credential)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCredentials(credential._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Client ID</Label>
                  <p className="text-muted-foreground">{credential.credentials.clientId}</p>
                </div>
                <div>
                  <Label className="font-medium">Priority</Label>
                  <p className="text-muted-foreground">{credential.priority}</p>
                </div>
                <div>
                  <Label className="font-medium">Auto Booking</Label>
                  <p className="text-muted-foreground">{credential.settings.autoBooking ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label className="font-medium">Max Weight</Label>
                  <p className="text-muted-foreground">{credential.settings.maxWeight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {credentials.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Credentials Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                This client doesn't have any courier service credentials configured yet.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Credentials
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Courier Credentials</DialogTitle>
            <DialogDescription>
              Update courier service credentials for this client
            </DialogDescription>
          </DialogHeader>
          <CredentialsForm
            formData={formData}
            setFormData={setFormData}
            providers={providers}
            onSubmit={handleUpdateCredentials}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingCredential(null);
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CredentialsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  providers: CourierProvider[];
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

function CredentialsForm({ 
  formData, 
  setFormData, 
  providers, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: CredentialsFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="providerId">Courier Provider</Label>
          <Select
            value={formData.providerId}
            onValueChange={(value) => setFormData({ ...formData, providerId: value })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider._id} value={provider._id}>
                  {provider.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            placeholder="Enter client ID"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            type="password"
            value={formData.clientSecret}
            onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
            placeholder="Enter client secret"
            required
          />
        </div>
        <div>
          <Label htmlFor="username">Username (Optional)</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter username"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password (Optional)</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
          />
        </div>
        <div>
          <Label htmlFor="apiKey">API Key (Optional)</Label>
          <Input
            id="apiKey"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="Enter API key"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="autoBooking"
              checked={formData.autoBooking}
              onCheckedChange={(checked) => setFormData({ ...formData, autoBooking: checked })}
            />
            <Label htmlFor="autoBooking">Auto Booking</Label>
          </div>
          <div>
            <Label htmlFor="preferredDeliveryType">Preferred Delivery Type</Label>
            <Select
              value={formData.preferredDeliveryType}
              onValueChange={(value) => setFormData({ ...formData, preferredDeliveryType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="overnight">Overnight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxWeight">Max Weight (kg)</Label>
            <Input
              id="maxWeight"
              type="number"
              value={formData.maxWeight}
              onChange={(e) => setFormData({ ...formData, maxWeight: Number(e.target.value) })}
              min="0.5"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="maxValue">Max Value (BDT)</Label>
            <Input
              id="maxValue"
              type="number"
              value={formData.maxValue}
              onChange={(e) => setFormData({ ...formData, maxValue: Number(e.target.value) })}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update' : 'Save'} Credentials
        </Button>
      </div>
    </form>
  );
}
