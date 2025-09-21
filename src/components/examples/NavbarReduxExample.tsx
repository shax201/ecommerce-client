"use client";

import React from "react";
import { useDispatch } from "react-redux";
import {
  useGetNavbarQuery,
  useUpdateNavbarMutation,
  useAddNavbarMenuMutation,
  useDeleteNavbarMenuMutation,
} from "@/lib/features/navbar";
import {
  useGetActiveDynamicMenusQuery,
} from "@/lib/features/dynamic-menus";
import {
  useGetLogosQuery,
} from "@/lib/features/logos";

/**
 * Example component showing how to use Redux API calls directly
 * without custom hooks
 */
export function NavbarReduxExample() {
  const dispatch = useDispatch();

  // Navbar API calls
  const {
    data: navbarData,
    isLoading: navbarLoading,
    error: navbarError,
    refetch: refetchNavbar,
  } = useGetNavbarQuery();

  const [updateNavbar, { isLoading: isUpdating }] = useUpdateNavbarMutation();
  const [addMenu, { isLoading: isAddingMenu }] = useAddNavbarMenuMutation();
  const [deleteMenu, { isLoading: isDeletingMenu }] = useDeleteNavbarMenuMutation();

  // Dynamic menus API calls
  const {
    data: dynamicMenusData,
    isLoading: dynamicMenusLoading,
    error: dynamicMenusError,
    refetch: refetchDynamicMenus,
  } = useGetActiveDynamicMenusQuery();

  // Logos API calls
  const {
    data: logosData,
    isLoading: logosLoading,
    error: logosError,
    refetch: refetchLogos,
  } = useGetLogosQuery();

  // Handle navbar update
  const handleUpdateNavbar = async () => {
    try {
      const result = await updateNavbar({
        menus: [
          {
            id: 1,
            label: "Updated Menu",
            type: "MenuItem",
            url: "/updated",
            isActive: true,
            order: 1,
          },
        ],
        isActive: true,
      }).unwrap();
      
      console.log("Navbar updated successfully:", result);
    } catch (error) {
      console.error("Failed to update navbar:", error);
    }
  };

  // Handle adding a new menu
  const handleAddMenu = async () => {
    try {
      const result = await addMenu({
        label: "New Menu",
        type: "MenuItem",
        url: "/new-menu",
        isActive: true,
        order: 1,
      }).unwrap();
      
      console.log("Menu added successfully:", result);
    } catch (error) {
      console.error("Failed to add menu:", error);
    }
  };

  // Handle deleting a menu
  const handleDeleteMenu = async (menuId: number) => {
    try {
      const result = await deleteMenu(menuId).unwrap();
      console.log("Menu deleted successfully:", result);
    } catch (error) {
      console.error("Failed to delete menu:", error);
    }
  };

  // Handle refreshing all data
  const handleRefreshAll = () => {
    refetchNavbar();
    refetchDynamicMenus();
    refetchLogos();
  };

  const isLoading = navbarLoading || dynamicMenusLoading || logosLoading;
  const hasError = navbarError || dynamicMenusError || logosError;

  if (isLoading) {
    return <div>Loading navbar data...</div>;
  }

  if (hasError) {
    return (
      <div>
        <p>Error loading data:</p>
        {navbarError && <p>Navbar: {JSON.stringify(navbarError)}</p>}
        {dynamicMenusError && <p>Dynamic Menus: {JSON.stringify(dynamicMenusError)}</p>}
        {logosError && <p>Logos: {JSON.stringify(logosError)}</p>}
        <button onClick={handleRefreshAll}>Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Navbar Redux Example</h2>
      
      {/* Navbar Data */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Navbar Data</h3>
        {navbarData?.data ? (
          <div>
            <p>Menus: {navbarData.data.menus?.length || 0}</p>
            <p>Active: {navbarData.data.isActive ? "Yes" : "No"}</p>
          </div>
        ) : (
          <p>No navbar data</p>
        )}
      </div>

      {/* Dynamic Menus Data */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Dynamic Menus</h3>
        {dynamicMenusData?.data?.length > 0 ? (
          <ul>
            {dynamicMenusData.data.map((menu: any) => (
              <li key={menu._id || menu.id} className="flex justify-between items-center">
                <span>{menu.name}</span>
                <button
                  onClick={() => handleDeleteMenu(menu._id || menu.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isDeletingMenu}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No dynamic menus</p>
        )}
      </div>

      {/* Logos Data */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Logos</h3>
        {logosData?.data && logosData.data.length > 0 ? (
          <ul>
            {logosData.data.map((logo: any) => (
              <li key={logo.id} className="flex items-center gap-2">
                <img src={logo.url} alt={logo.altText} className="w-8 h-8" />
                <span>{logo.name} ({logo.type})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No logos</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleUpdateNavbar}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Navbar"}
        </button>
        
        <button
          onClick={handleAddMenu}
          disabled={isAddingMenu}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isAddingMenu ? "Adding..." : "Add Menu"}
        </button>
        
        <button
          onClick={handleRefreshAll}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh All
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
        <h4 className="font-semibold">Debug Info:</h4>
        <p>Navbar Loading: {navbarLoading ? "Yes" : "No"}</p>
        <p>Dynamic Menus Loading: {dynamicMenusLoading ? "Yes" : "No"}</p>
        <p>Logos Loading: {logosLoading ? "Yes" : "No"}</p>
        <p>Total Menus: {navbarData?.data?.menus?.length || 0}</p>
        <p>Dynamic Menus Count: {dynamicMenusData?.data?.length || 0}</p>
        <p>Logos Count: {logosData?.data?.length || 0}</p>
      </div>
    </div>
  );
}
