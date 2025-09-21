"use client";

import React, { useState } from "react";
import {
  useGetNavbarQuery,
  useUpdateNavbarMutation,
  useAddNavbarMenuMutation,
} from "@/lib/features/navbar";
import {
  useGetActiveDynamicMenusQuery,
} from "@/lib/features/dynamic-menus";
import {
  useGetLogosQuery,
} from "@/lib/features/logos";

/**
 * Test component to verify Redux API calls are working
 * This component will always make API calls on the client side
 */
export function ReduxApiTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Navbar API
  const {
    data: navbarData,
    isLoading: navbarLoading,
    error: navbarError,
    refetch: refetchNavbar,
  } = useGetNavbarQuery();

  // Dynamic Menus API
  const {
    data: dynamicMenusData,
    isLoading: dynamicMenusLoading,
    error: dynamicMenusError,
    refetch: refetchDynamicMenus,
  } = useGetActiveDynamicMenusQuery();

  // Logos API
  const {
    data: logoData,
    isLoading: logosLoading,
    error: logosError,
    refetch: refetchLogos,
  } = useGetLogosQuery();

  // Mutations for testing
  const [updateNavbar, { isLoading: isUpdating }] = useUpdateNavbarMutation();
  const [addMenu, { isLoading: isAddingMenu }] = useAddNavbarMenuMutation();

  // Test functions
  const testNavbarApi = async () => {
    addResult("Testing Navbar API...");
    try {
      const result = await refetchNavbar();
      if (result.data) {
        addResult(`✅ Navbar API Success: ${JSON.stringify(result.data).substring(0, 100)}...`);
      } else {
        addResult(`❌ Navbar API Failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Navbar API Error: ${error}`);
    }
  };

  const testDynamicMenusApi = async () => {
    addResult("Testing Dynamic Menus API...");
    try {
      const result = await refetchDynamicMenus();
      if (result.data) {
        addResult(`✅ Dynamic Menus API Success: Found ${result.data.data?.length || 0} menus`);
      } else {
        addResult(`❌ Dynamic Menus API Failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Dynamic Menus API Error: ${error}`);
    }
  };

  const testLogosApi = async () => {
    addResult("Testing Logos API...");
    try {
      const result = await refetchLogos();
      if (result.data) {
        addResult(`✅ Logos API Success: Found ${result.data.data?.length || 0} logos`);
      } else {
        addResult(`❌ Logos API Failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Logos API Error: ${error}`);
    }
  };

  const testAllApis = async () => {
    addResult("🚀 Testing All APIs...");
    await testNavbarApi();
    await testDynamicMenusApi();
    await testLogosApi();
    addResult("✅ All API tests completed");
  };

  const testMutation = async () => {
    addResult("Testing Navbar Mutation...");
    try {
      const result = await updateNavbar({
        menus: [
          {
            id: 1,
            label: "Test Menu",
            type: "MenuItem",
            url: "/test",
            isActive: true,
            order: 1,
          },
        ],
        isActive: true,
      }).unwrap();
      addResult(`✅ Mutation Success: ${JSON.stringify(result).substring(0, 100)}...`);
    } catch (error) {
      addResult(`❌ Mutation Error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Redux API Test Component</h2>
      
      {/* Current State */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="text-lg font-semibold mb-2">Current API State:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Navbar API</h4>
            <p>Loading: {navbarLoading ? "Yes" : "No"}</p>
            <p>Error: {navbarError ? "Yes" : "No"}</p>
            <p>Data: {navbarData?.data ? "Available" : "None"}</p>
          </div>
          <div>
            <h4 className="font-medium">Dynamic Menus API</h4>
            <p>Loading: {dynamicMenusLoading ? "Yes" : "No"}</p>
            <p>Error: {dynamicMenusError ? "Yes" : "No"}</p>
            <p>Data: {dynamicMenusData?.data ? `${dynamicMenusData.data.length} items` : "None"}</p>
          </div>
          <div>
            <h4 className="font-medium">Logos API</h4>
            <p>Loading: {logosLoading ? "Yes" : "No"}</p>
            <p>Error: {logosError ? "Yes" : "No"}</p>
            <p>Data: {logoData?.data ? `${logoData.data.length} items` : "None"}</p>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Actions:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAllApis}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test All APIs
          </button>
          <button
            onClick={testNavbarApi}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Navbar API
          </button>
          <button
            onClick={testDynamicMenusApi}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Dynamic Menus API
          </button>
          <button
            onClick={testLogosApi}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Test Logos API
          </button>
          <button
            onClick={testMutation}
            disabled={isUpdating}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isUpdating ? "Testing..." : "Test Mutation"}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click a test button above.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Raw Data Display */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Raw API Data:</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Navbar Data:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(navbarData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Dynamic Menus Data:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(dynamicMenusData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium">Logos Data:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(logoData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(navbarError || dynamicMenusError || logosError) && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Errors:</h3>
          <div className="space-y-2">
            {navbarError && (
              <div className="bg-red-100 p-2 rounded">
                <strong>Navbar Error:</strong> {JSON.stringify(navbarError)}
              </div>
            )}
            {dynamicMenusError && (
              <div className="bg-red-100 p-2 rounded">
                <strong>Dynamic Menus Error:</strong> {JSON.stringify(dynamicMenusError)}
              </div>
            )}
            {logosError && (
              <div className="bg-red-100 p-2 rounded">
                <strong>Logos Error:</strong> {JSON.stringify(logosError)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
