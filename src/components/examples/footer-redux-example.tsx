"use client";

import React from 'react';
import { useFooterRedux } from '@/hooks/use-footer-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, RefreshCw } from 'lucide-react';

/**
 * Example component demonstrating Redux integration for Footer Management
 * This shows how to use the useFooterRedux hook for General Information updates
 */
export function FooterReduxExample() {
  const {
    // Data
    footer,
    isInitialized,
    
    // Loading states
    loading,
    updating,
    deleting,
    
    // Error states
    error,
    updateError,
    deleteError,
    
    // UI states
    isGeneralModalOpen,
    isContactModalOpen,
    
    // Operations
    updateGeneralInfo,
    updateContactInfo,
    
    // UI operations
    openGeneralModal,
    closeGeneralModal,
    openContactModal,
    closeContactModal,
    
    // Utility functions
    refreshFooter,
    clearAllErrors,
  } = useFooterRedux({ autoFetch: true });

  const handleTestGeneralUpdate = async () => {
    const testData = {
      copyright: `© ${new Date().getFullYear()} Test Company. All rights reserved.`,
      description: 'This is a test description updated via Redux.',
      logoUrl: 'https://example.com/test-logo.png',
      logoAlt: 'Test Company Logo',
    };

    await updateGeneralInfo(testData);
  };

  const handleTestContactUpdate = async () => {
    const testData = {
      email: 'test@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Test Street, Test City, TC 12345',
      socialMedia: {
        facebook: 'https://facebook.com/testcompany',
        twitter: 'https://twitter.com/testcompany',
        instagram: 'https://instagram.com/testcompany',
        github: 'https://github.com/testcompany',
      },
    };

    await updateContactInfo(testData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading footer data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading footer data: {String(error)}
        </div>
        <Button onClick={refreshFooter}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Footer Redux Example</h2>
          <p className="text-muted-foreground">
            Demonstrating Redux integration for footer management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshFooter} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearAllErrors} variant="outline">
            Clear Errors
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Loading State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-green-500" />
              )}
              <span className="text-sm">{loading ? 'Loading...' : 'Ready'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Updating State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-green-500" />
              )}
              <span className="text-sm">{updating ? 'Updating...' : 'Ready'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Initialized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">{isInitialized ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {(error || updateError || deleteError) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {error && <div className="text-sm text-red-600">General Error: {String(error)}</div>}
              {updateError && <div className="text-sm text-red-600">Update Error: {String(updateError)}</div>}
              {deleteError && <div className="text-sm text-red-600">Delete Error: {String(deleteError)}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Data Display */}
      {footer && (
        <Card>
          <CardHeader>
            <CardTitle>Current Footer Data</CardTitle>
            <CardDescription>
              Data loaded via Redux RTK Query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">General Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Copyright: {footer.copyright || 'Not set'}</div>
                  <div>Description: {footer.description || 'Not set'}</div>
                  <div>Logo URL: {footer.logoUrl || 'Not set'}</div>
                  <div>Logo Alt: {footer.logoAlt || 'Not set'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Contact Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Email: {footer.contactInfo?.email || 'Not set'}</div>
                  <div>Phone: {footer.contactInfo?.phone || 'Not set'}</div>
                  <div>Address: {footer.contactInfo?.address || 'Not set'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Sections</h4>
                <div className="text-sm text-muted-foreground">
                  {footer.sections?.length || 0} sections
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>
            Test the Redux operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestGeneralUpdate}
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Test General Update
            </Button>

            <Button
              onClick={handleTestContactUpdate}
              disabled={updating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Test Contact Update
            </Button>

            <Button
              onClick={openGeneralModal}
              variant="outline"
            >
              Open General Modal
            </Button>

            <Button
              onClick={openContactModal}
              variant="outline"
            >
              Open Contact Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal States */}
      <Card>
        <CardHeader>
          <CardTitle>Modal States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isGeneralModalOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">General Modal: {isGeneralModalOpen ? 'Open' : 'Closed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isContactModalOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Contact Modal: {isContactModalOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
