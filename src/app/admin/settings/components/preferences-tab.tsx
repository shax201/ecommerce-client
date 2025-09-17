'use client';

import { useState } from 'react';
import { useUpdateOwnPreferencesMutation } from '@/lib/features/user-settings';
import { UserPreferences } from '@/lib/features/user-settings';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Settings, Globe, DollarSign, Bell } from 'lucide-react';

interface PreferencesTabProps {
  preferences: UserPreferences | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'CNY', label: 'Chinese Yuan (¥)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'BRL', label: 'Brazilian Real (R$)' },
];

export function PreferencesTab({ preferences, onSuccess, onError }: PreferencesTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    language: preferences?.language || 'en',
    currency: preferences?.currency || 'USD',
    notifications: preferences?.notifications ?? true,
  });

  const [updatePreferences, { isLoading }] = useUpdateOwnPreferencesMutation();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updatePreferences(formData).unwrap();
      setIsEditing(false);
      onSuccess('Preferences updated successfully');
    } catch (error: any) {
      onError(error?.data?.message || error?.message || 'Failed to update preferences');
    }
  };

  const handleCancel = () => {
    setFormData({
      language: preferences?.language || 'en',
      currency: preferences?.currency || 'USD',
      notifications: preferences?.notifications ?? true,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Choose your preferred language and currency for the interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email notifications about your account and orders
              </p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) => handleInputChange('notifications', checked)}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Preferences
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
