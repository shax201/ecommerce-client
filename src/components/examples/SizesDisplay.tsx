"use client";

import React, { useState } from "react";
import { useGetSizesQuery, useCreateSizeMutation, useUpdateSizeMutation, useDeleteSizeMutation } from "@/lib/features/attributes/sizesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Ruler } from "lucide-react";

/**
 * SizesDisplay component showing all available sizes with CRUD operations
 */
export default function SizesDisplay() {
  const [newSize, setNewSize] = useState("");
  const [editingSize, setEditingSize] = useState<{ id: string; size: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  // API hooks
  const {
    data: sizesData,
    error: sizesError,
    isLoading: isLoadingSizes,
    refetch: refetchSizes,
  } = useGetSizesQuery();

  const [createSize, { isLoading: isCreating }] = useCreateSizeMutation();
  const [updateSize, { isLoading: isUpdating }] = useUpdateSizeMutation();
  const [deleteSize, { isLoading: isDeleting }] = useDeleteSizeMutation();

  const sizes = sizesData?.data || [];

  // Size type detection for better display
  const getSizeType = (size: string) => {
    const numericSize = parseFloat(size);
    
    if (!isNaN(numericSize)) {
      if (numericSize < 10) return "clothing"; // XS, S, M, L, XL, etc.
      if (numericSize < 50) return "shoes"; // 6, 7, 8, 9, 10, etc.
      return "measurement"; // 28, 30, 32, etc. (waist, chest)
    }
    
    if (size.includes("XL") || size.includes("XXL") || size.includes("XXXL")) return "clothing";
    if (size.includes("S") || size.includes("M") || size.includes("L")) return "clothing";
    if (size.includes("US") || size.includes("UK") || size.includes("EU")) return "shoes";
    
    return "other";
  };

  const getSizeDisplay = (size: string) => {
    const type = getSizeType(size);
    
    const typeStyles = {
      clothing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      shoes: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      measurement: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      other: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    };

    return typeStyles[type];
  };

  const getSizeIcon = (size: string) => {
    const type = getSizeType(size);
    
    switch (type) {
      case 'clothing': return '👕';
      case 'shoes': return '👟';
      case 'measurement': return '📏';
      default: return '📦';
    }
  };

  const handleCreateSize = async () => {
    if (!newSize.trim()) return;

    try {
      await createSize({ size: newSize.trim() }).unwrap();
      setNewSize("");
      refetchSizes();
    } catch (error) {
      console.error("Failed to create size:", error);
      alert("Failed to create size");
    }
  };

  const handleUpdateSize = async () => {
    if (!editingSize || !editValue.trim()) return;

    try {
      await updateSize({
        id: editingSize.id,
        payload: { size: editValue.trim() }
      }).unwrap();
      setEditingSize(null);
      setEditValue("");
      refetchSizes();
    } catch (error) {
      console.error("Failed to update size:", error);
      alert("Failed to update size");
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;

    try {
      await deleteSize(id).unwrap();
      refetchSizes();
    } catch (error) {
      console.error("Failed to delete size:", error);
      alert("Failed to delete size");
    }
  };

  const startEditing = (size: { _id: string; size: string }) => {
    setEditingSize({ id: size._id, size: size.size });
    setEditValue(size.size);
  };

  const cancelEditing = () => {
    setEditingSize(null);
    setEditValue("");
  };

  // Group sizes by type for better organization
  const groupedSizes = sizes.reduce((acc, size) => {
    const type = getSizeType(size.size);
    if (!acc[type]) acc[type] = [];
    acc[type].push(size);
    return acc;
  }, {} as Record<string, typeof sizes>);

  const typeLabels = {
    clothing: "Clothing Sizes",
    shoes: "Shoe Sizes", 
    measurement: "Measurements",
    other: "Other Sizes"
  };

  if (isLoadingSizes) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading sizes...</span>
      </div>
    );
  }

  if (sizesError) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Failed to load sizes</p>
        <Button onClick={() => refetchSizes()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Ruler className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Sizes Management</h1>
        <Badge variant="secondary">{sizes.length} sizes</Badge>
      </div>

      {/* Add New Size */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter size (e.g., S, M, L, 8, 10, 28, 30)"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSize()}
              className="flex-1"
            />
            <Button
              onClick={handleCreateSize}
              disabled={isCreating || !newSize.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Size
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Examples: Clothing (XS, S, M, L, XL), Shoes (6, 7, 8, 9, 10), Measurements (28, 30, 32, 34)
          </p>
        </CardContent>
      </Card>

      {/* Sizes by Type */}
      {Object.entries(groupedSizes).map(([type, typeSizes]) => (
        <Card key={type} className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getSizeIcon(typeSizes[0]?.size || '')}</span>
              {typeLabels[type as keyof typeof typeLabels]}
              <Badge variant="outline">{typeSizes.length} sizes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {typeSizes.map((size) => {
                const sizeDisplay = getSizeDisplay(size.size);
                
                return (
                  <div
                    key={size._id}
                    className="relative group"
                  >
                    <div className={`p-3 rounded-lg border-2 ${sizeDisplay.bg} ${sizeDisplay.border} ${sizeDisplay.text} text-center transition-all hover:shadow-md`}>
                      <div className="font-semibold text-lg">{size.size}</div>
                      
                      {/* Action buttons */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => startEditing(size)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteSize(size._id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingSize?.id === size._id && (
                      <div className="absolute top-0 left-0 right-0 bg-white border-2 border-blue-500 rounded-lg p-2 z-10 shadow-lg">
                        <div className="flex gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="New size"
                            className="flex-1 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleUpdateSize}
                            disabled={isUpdating || !editValue.trim()}
                            className="h-8 px-2"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "✓"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {sizes.length === 0 && (
        <div className="text-center py-12">
          <Ruler className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No sizes found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first size above.</p>
        </div>
      )}
    </div>
  );
}
