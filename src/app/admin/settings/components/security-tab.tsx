'use client';

import { useState } from 'react';
import { useUpdateOwnEmailMutation, useChangeOwnPasswordMutation } from '@/lib/features/user-settings';
import { UserProfile } from '@/lib/features/user-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSettingsService } from '@/lib/features/user-settings/userSettingsService';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface SecurityTabProps {
  profile: UserProfile | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function SecurityTab({ profile, onSuccess, onError }: SecurityTabProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string[];
  }>({});

  const [updateEmail, { isLoading: isUpdatingEmail }] = useUpdateOwnEmailMutation();
  const [changePassword, { isLoading: isChangingPasswordMutation }] = useChangeOwnPasswordMutation();

  const handleEmailChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const validateEmail = () => {
    if (!UserSettingsService.validateEmail(emailData.newEmail)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const validation = UserSettingsService.validatePassword(passwordData.newPassword);
    if (!validation.isValid) {
      setValidationErrors(prev => ({ ...prev, password: validation.errors }));
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setValidationErrors(prev => ({ 
        ...prev, 
        password: [...(prev.password || []), 'Passwords do not match'] 
      }));
      return false;
    }
    return true;
  };

  const handleUpdateEmail = async () => {
    if (!validateEmail()) return;

    try {
      await updateEmail(emailData).unwrap();
      setIsEditingEmail(false);
      setEmailData({ newEmail: '', currentPassword: '' });
      onSuccess('Email updated successfully. Please verify your new email address.');
    } catch (error: any) {
      onError(error?.data?.message || error?.message || 'Failed to update email');
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      await changePassword(passwordData).unwrap();
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess('Password changed successfully');
    } catch (error: any) {
      onError(error?.data?.message || error?.message || 'Failed to change password');
    }
  };

  const handleCancelEmail = () => {
    setIsEditingEmail(false);
    setEmailData({ newEmail: '', currentPassword: '' });
    setValidationErrors(prev => ({ ...prev, email: undefined }));
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setValidationErrors(prev => ({ ...prev, password: undefined }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isLoading = isUpdatingEmail || isChangingPasswordMutation;

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
          <CardDescription>
            Update your email address. You'll need to verify the new email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          {isEditingEmail ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                  placeholder="Enter new email address"
                />
                {validationErrors.email && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationErrors.email}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Current Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailData.currentPassword}
                  onChange={(e) => handleEmailChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEmail}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateEmail}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Email
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsEditingEmail(true)}>
              Change Email
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChangingPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {validationErrors.password && validationErrors.password.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.password.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelPassword}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
