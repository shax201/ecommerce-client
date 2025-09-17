'use client';

import { useState, useEffect } from 'react';
import { useGetOwnProfileQuery, useGetOwnPreferencesQuery } from '@/lib/features/user-settings';
import { UserSettingsTabs } from './components/user-settings-tabs';
import { ProfileTab } from './components/profile-tab';
import { SecurityTab } from './components/security-tab';
import { PreferencesTab } from './components/preferences-tab';
import { UserSettingsSkeleton } from './components/user-settings-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user profile and preferences
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetOwnProfileQuery();

  const {
    data: preferencesData,
    isLoading: preferencesLoading,
    error: preferencesError,
    refetch: refetchPreferences,
  } = useGetOwnPreferencesQuery();

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    // Refetch data to get updated information
    refetchProfile();
    refetchPreferences();
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };

  const isLoading = profileLoading || preferencesLoading;
  const hasError = profileError || preferencesError;

  if (isLoading) {
    return <UserSettingsSkeleton />;
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile information, security settings, and preferences.
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <UserSettingsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profileData?.data || null}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              profile={profileData?.data || null}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {activeTab === 'preferences' && (
            <PreferencesTab
              preferences={preferencesData?.data || null}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
