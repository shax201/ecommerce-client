'use client';

import { useState } from 'react';
import { useUpdateOwnProfileMutation, useUpdateOwnPhoneMutation } from '@/lib/features/user-settings';
import { UserProfile } from '@/lib/features/user-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserSettingsService } from '@/lib/features/user-settings/userSettingsService';
import { Loader2, User, Phone } from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ProfileTab({ profile, onSuccess, onError }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateOwnProfileMutation();
  const [updatePhone, { isLoading: isUpdatingPhone }] = useUpdateOwnPhoneMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const { phone, ...profileData } = formData;
      
      // Update profile (names)
      await updateProfile(profileData).unwrap();
      
      // Update phone separately
      await updatePhone({ phone: phone || undefined }).unwrap();
      
      setIsEditing(false);
      onSuccess('Profile updated successfully');
    } catch (error: any) {
      onError(error?.data?.message || error?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  const isLoading = isUpdatingProfile || isUpdatingPhone;

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">
              Email cannot be changed here. Use the Security tab to update your email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <Separator />

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
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Role</Label>
              <p className="text-sm font-medium capitalize">{profile?.role}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <p className="text-sm font-medium capitalize">{profile?.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
              <p className="text-sm font-medium">
                {profile?.isEmailVerified ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Member Since</Label>
              <p className="text-sm font-medium">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
