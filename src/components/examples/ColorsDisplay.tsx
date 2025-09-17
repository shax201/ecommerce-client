"use client";

import React, { useState } from "react";
import { useGetColorsQuery, useCreateColorMutation, useUpdateColorMutation, useDeleteColorMutation } from "@/lib/features/attributes/colorsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Palette } from "lucide-react";

/**
 * ColorsDisplay component showing all available colors with CRUD operations
 */
export default function ColorsDisplay() {
  const [newColor, setNewColor] = useState("");
  const [editingColor, setEditingColor] = useState<{ id: string; color: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  // API hooks
  const {
    data: colorsData,
    error: colorsError,
    isLoading: isLoadingColors,
    refetch: refetchColors,
  } = useGetColorsQuery();

  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  const colors = colorsData?.data || [];

  // Color mapping for display
  const getColorDisplay = (colorName: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      'red': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
      'blue': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
      'green': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
      'yellow': { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500' },
      'purple': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
      'pink': { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
      'orange': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
      'black': { bg: 'bg-black', text: 'text-white', border: 'border-black' },
      'white': { bg: 'bg-white', text: 'text-black', border: 'border-gray-300' },
      'gray': { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' },
      'brown': { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-800' },
      'navy': { bg: 'bg-blue-900', text: 'text-white', border: 'border-blue-900' },
      'maroon': { bg: 'bg-red-900', text: 'text-white', border: 'border-red-900' },
      'teal': { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500' },
      'lime': { bg: 'bg-lime-500', text: 'text-black', border: 'border-lime-500' },
    };

    return colorMap[colorName.toLowerCase()] || { 
      bg: 'bg-gray-200', 
      text: 'text-gray-800', 
      border: 'border-gray-300' 
    };
  };

  const handleCreateColor = async () => {
    if (!newColor.trim()) return;

    try {
      await createColor({ color: newColor.trim() }).unwrap();
      setNewColor("");
      refetchColors();
    } catch (error) {
      console.error("Failed to create color:", error);
      alert("Failed to create color");
    }
  };

  const handleUpdateColor = async () => {
    if (!editingColor || !editValue.trim()) return;

    try {
      await updateColor({
        id: editingColor.id,
        payload: { color: editValue.trim() }
      }).unwrap();
      setEditingColor(null);
      setEditValue("");
      refetchColors();
    } catch (error) {
      console.error("Failed to update color:", error);
      alert("Failed to update color");
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      await deleteColor(id).unwrap();
      refetchColors();
    } catch (error) {
      console.error("Failed to delete color:", error);
      alert("Failed to delete color");
    }
  };

  const startEditing = (color: { _id: string; color: string }) => {
    setEditingColor({ id: color._id, color: color.color });
    setEditValue(color.color);
  };

  const cancelEditing = () => {
    setEditingColor(null);
    setEditValue("");
  };

  if (isLoadingColors) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading colors...</span>
      </div>
    );
  }

  if (colorsError) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Failed to load colors</p>
        <Button onClick={() => refetchColors()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Colors Management</h1>
        <Badge variant="secondary">{colors.length} colors</Badge>
      </div>

      {/* Add New Color */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter color name (e.g., Red, Blue, Green)"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateColor()}
              className="flex-1"
            />
            <Button
              onClick={handleCreateColor}
              disabled={isCreating || !newColor.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Color
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Colors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {colors.map((color) => {
          const colorDisplay = getColorDisplay(color.color);
          
          return (
            <Card key={color._id} className="relative group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${colorDisplay.bg} ${colorDisplay.border} flex items-center justify-center`}
                    >
                      <div className={`w-4 h-4 rounded-full ${colorDisplay.bg}`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{color.color}</h3>
                      <p className="text-sm text-gray-500">
                        ID: {color._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(color)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteColor(color._id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Edit Form */}
                {editingColor?.id === color._id && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="New color name"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateColor}
                        disabled={isUpdating || !editValue.trim()}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  Created: {new Date(color.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {colors.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No colors found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first color above.</p>
        </div>
      )}
    </div>
  );
}
