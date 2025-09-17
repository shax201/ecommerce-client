"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, Trash2, Plus, Loader2, RefreshCw, GripVertical, AlertCircle, Edit, Copy, MoreVertical, Check, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useClientLogosRedux } from "@/hooks/use-client-logos-redux";
import { type ClientLogoFormData } from "@/actions/content";
import { type ClientLogoData } from "@/lib/features/client-logos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Types are now imported from Redux slice

export function ClientLogosManagement() {
  // Use the custom Redux hook for better data management
  const {
    logos: clientLogos,
    selectedLogos: selectedItems,
    loading: isLoading,
    error,
    editingField,
    editingValue,
    loadLogos,
    createLogo,
    updateLogo,
    deleteLogo,
    reorderLogos,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    selectLogo,
    deselectLogo,
    selectAllLogos,
    clearSelection,
    toggleLogoSelection,
    startInlineEdit,
    updateEditingValue,
    cancelInlineEdit,
    saveInlineEdit,
    refresh,
  } = useClientLogosRedux();

  const [editingLogo, setEditingLogo] = useState<ClientLogoData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Load client logos on component mount
  useEffect(() => {
    if (clientLogos.length === 0) {
      loadLogos();
    }
  }, [clientLogos.length, loadLogos]);

  const handleSave = async (logoData: ClientLogoFormData): Promise<void> => {
    try {
      setIsSaving(true);
      
      if (editingLogo) {
        // Update existing client logo
        await updateLogo(editingLogo._id, logoData);
        setEditingLogo(null);
      } else {
        // Create new client logo
        await createLogo(logoData);
      }
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error saving client logo:", error);
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const logo = clientLogos.find(l => l._id === id);
    if (!logo) return;

    if (!confirm(`Are you sure you want to delete "${logo.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(id);
      await deleteLogo(id);
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error deleting client logo:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    const logo = clientLogos.find((l) => l._id === id);
    if (!logo) return;

    try {
      await updateLogo(id, {
        isActive: !logo.isActive,
      });
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error toggling client logo status:", error);
    }
  };

  const handleReorder = async (updates: { id: string; order: number }[]) => {
    try {
      await reorderLogos({ updates });
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error reordering client logos:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = clientLogos.findIndex(l => l._id === draggedItem);
    const targetIndex = clientLogos.findIndex(l => l._id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Create new order array
    const newLogos = [...clientLogos];
    const [draggedLogo] = newLogos.splice(draggedIndex, 1);
    newLogos.splice(targetIndex, 0, draggedLogo);

    // Update order values
    const updates = newLogos.map((logo, index) => ({
      id: logo._id,
      order: index + 1
    }));

    // Update local state immediately for better UX
    // This is now handled by Redux in the reorderLogos action

    // Send to backend
    handleReorder(updates);
    setDraggedItem(null);
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.size === clientLogos.length) {
      clearSelection();
    } else {
      selectAllLogos();
    }
  };

  const handleSelectItem = (id: string) => {
    toggleLogoSelection(id);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} client logo(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkOperating(true);
      await bulkDelete(Array.from(selectedItems));
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error in bulk delete:", error);
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedItems.size === 0) return;

    try {
      setIsBulkOperating(true);
      if (isActive) {
        await bulkActivate(Array.from(selectedItems));
      } else {
        await bulkDeactivate(Array.from(selectedItems));
      }
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error in bulk toggle:", error);
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleDuplicate = async (logo: ClientLogoData) => {
    try {
      setIsSaving(true);

      const duplicateData: ClientLogoFormData = {
        name: `${logo.name} (Copy)`,
        description: logo.description,
        logoUrl: logo.logoUrl,
        websiteUrl: logo.websiteUrl,
        altText: logo.altText,
        isActive: false, // Duplicated items start as inactive
        order: clientLogos.length + 1
      };

      await createLogo(duplicateData);
    } catch (error) {
      // Error handling is done in the Redux hook
      console.error("Error duplicating client logo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline editing functions
  const startInlineEditAction = (id: string, field: string, currentValue: string) => {
    startInlineEdit(id, field, currentValue);
  };

  const cancelInlineEditAction = () => {
    cancelInlineEdit();
  };

  const saveInlineEditAction = async () => {
    await saveInlineEdit();
  };

  const handleInlineKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEditAction();
    } else if (e.key === 'Escape') {
      cancelInlineEditAction();
    }
  };


  const activeLogos = [...clientLogos]
    .filter((logo) => logo.isActive)
    .sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading client logos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage Client Logos</h3>
          <p className="text-sm text-muted-foreground">
            Manage client logos and brand partnerships displayed on your website
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bulk Operations Toolbar */}
      {clientLogos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.size === clientLogos.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">
                    Select All ({selectedItems.size}/{clientLogos.length})
                  </Label>
        </div>

                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.size} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkToggleActive(true)}
                      disabled={isBulkOperating}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkToggleActive(false)}
                      disabled={isBulkOperating}
                    >
                      Deactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isBulkOperating}
                    >
                      {isBulkOperating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                </div>
              )}
                </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedItems.size === 0}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      <div className="space-y-4">
        <h4 className="text-md font-medium">Manage Client Logos</h4>
        {isLoading ? (
          // Skeleton loading for logo cards
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />í
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : clientLogos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No client logos found. Create your first client logo below.
            </div>
          </div>
        ) : (
          [...clientLogos]
            .sort((a, b) => a.order - b.order)
            .map((logo) => (
          <Card 
            key={logo._id} 
            className={`relative transition-all duration-200 ${
              draggedItem === logo._id ? 'opacity-50 scale-95' : ''
            } ${selectedItems.has(logo._id) ? 'ring-2 ring-primary' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, logo._id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, logo._id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.has(logo._id)}
                    onCheckedChange={() => handleSelectItem(logo._id)}
                  />
                  <div 
                    className="cursor-move p-1 hover:bg-muted rounded"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        Order: {logo.order}
                      </span>
                      {editingField?.id === logo._id && editingField?.field === 'name' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingValue}
                            onChange={(e) => updateEditingValue(e.target.value)}
                            onKeyDown={handleInlineKeyPress}
                            className="h-8"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveInlineEditAction}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelInlineEditAction}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded"
                          onClick={() => startInlineEditAction(logo._id, 'name', logo.name)}
                        >
                    <CardTitle className="text-lg">{logo.name}</CardTitle>
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {editingField?.id === logo._id && editingField?.field === 'description' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={editingValue}
                          onChange={(e) => updateEditingValue(e.target.value)}
                          onKeyDown={handleInlineKeyPress}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveInlineEditAction}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelInlineEditAction}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted p-1 rounded -ml-1"
                        onClick={() => startInlineEditAction(logo._id, 'description', logo.description || '')}
                      >
                        <CardDescription className="flex items-center gap-1">
                          {logo.description || 'Click to add description'}
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={logo.isActive}
                      onCheckedChange={() => handleToggleActive(logo._id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {logo.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingLogo(logo)}
                    title="Edit details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicate(logo)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(logo._id)}
                        className="text-destructive"
                        disabled={isDeleting === logo._id}
                      >
                        {isDeleting === logo._id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded-lg flex items-center justify-center relative">
                  {logo.logoUrl ? (
                    <Image
                      src={logo.logoUrl}
                      alt={logo.altText}
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs">No logo</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Website URL</Label>
                    <div className="text-sm text-muted-foreground">
                      {logo.websiteUrl || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order</Label>
                    <div className="text-sm text-muted-foreground">
                      {logo.order}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Alt Text</Label>
                  <div className="text-sm text-muted-foreground">
                    {logo.altText}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Add New Client Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientLogoForm
            onSave={handleSave}
          />
        </CardContent>
      </Card>

      {/* Quick Edit Modal */}
      <Dialog open={!!editingLogo} onOpenChange={() => setEditingLogo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Edit Client Logo</DialogTitle>
          </DialogHeader>
          {editingLogo && (
            <ClientLogoForm
              logo={editingLogo}
              onSave={handleSave}
              onCancel={() => setEditingLogo(null)}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ClientLogoFormProps {
  logo?: ClientLogoData;
  onSave: (data: ClientLogoFormData) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
}

function ClientLogoForm({
  logo,
  onSave,
  onCancel,
  isSaving = false,
}: ClientLogoFormProps) {
  const [formData, setFormData] = useState<ClientLogoFormData>({
    name: logo?.name || "",
    description: logo?.description || "",
    logoUrl: logo?.logoUrl || "",
    websiteUrl: logo?.websiteUrl || "",
    altText: logo?.altText || "",
    isActive: logo?.isActive ?? true,
    order: logo?.order || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Client name is required";
        } else if (value.length > 100) {
          newErrors.name = "Client name must be less than 100 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (value && value.length > 500) {
          newErrors.description = "Description must be less than 500 characters";
        } else {
          delete newErrors.description;
        }
        break;
      case 'logoUrl':
        if (!value.trim()) {
          newErrors.logoUrl = "Logo URL is required";
        } else if (!isValidUrl(value)) {
          newErrors.logoUrl = "Logo URL must be a valid URL";
        } else {
          delete newErrors.logoUrl;
        }
        break;
      case 'websiteUrl':
        if (value && value.trim() && !isValidUrl(value)) {
          newErrors.websiteUrl = "Website URL must be a valid URL";
        } else {
          delete newErrors.websiteUrl;
        }
        break;
      case 'altText':
        if (!value.trim()) {
          newErrors.altText = "Alt text is required for accessibility";
        } else if (value.length > 200) {
          newErrors.altText = "Alt text must be less than 200 characters";
        } else {
          delete newErrors.altText;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (formData.name.trim().length > 100) {
      newErrors.name = "Client name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (!formData.logoUrl.trim()) {
      newErrors.logoUrl = "Logo URL is required";
    } else if (!isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Logo URL must be a valid URL";
    }

    if (formData.websiteUrl && formData.websiteUrl.trim() && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Website URL must be a valid URL";
    }

    if (!formData.altText.trim()) {
      newErrors.altText = "Alt text is required for accessibility";
    }

    if (formData.altText.trim().length > 200) {
      newErrors.altText = "Alt text must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      // Clean the form data - remove empty strings for optional fields
      const cleanedFormData: ClientLogoFormData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        logoUrl: formData.logoUrl.trim(),
        websiteUrl: formData.websiteUrl?.trim() || undefined,
        altText: formData.altText.trim(),
        isActive: formData.isActive,
        order: formData.order,
      };

      await onSave(cleanedFormData);
      
      // Only reset form if this is a new client logo (not editing)
    if (!logo) {
      setFormData({
        name: "",
        description: "",
        logoUrl: "",
        websiteUrl: "",
        altText: "",
        isActive: true,
          order: 1,
        });
        setErrors({});
        setImagePreview(null);
      }
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };


  const clearImage = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Client Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, name: value }));
              validateField('name', value);
            }}
            placeholder="Enter client name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, websiteUrl: value }));
              validateField('websiteUrl', value);
            }}
            placeholder="https://example.com"
            className={errors.websiteUrl ? "border-red-500" : ""}
          />
          {errors.websiteUrl && (
            <p className="text-sm text-red-500">{errors.websiteUrl}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, description: value }));
            validateField('description', value);
          }}
          placeholder="Enter client description"
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="altText">Alt Text *</Label>
        <Input
          id="altText"
          value={formData.altText}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, altText: value }));
            validateField('altText', value);
          }}
          placeholder="Enter alt text for accessibility"
          className={errors.altText ? "border-red-500" : ""}
        />
        {errors.altText && (
          <p className="text-sm text-red-500">{errors.altText}</p>
        )}
      </div>


      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL *</Label>
          <Input
          id="logoUrl"
          value={formData.logoUrl}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, logoUrl: value }));
            setImagePreview(value);
            validateField('logoUrl', value);
          }}
          placeholder="Enter logo URL"
          className={errors.logoUrl ? "border-red-500" : ""}
        />
        {errors.logoUrl && (
          <p className="text-sm text-red-500">{errors.logoUrl}</p>
        )}
      </div>

      {/* Image Preview */}
      {(imagePreview || formData.logoUrl) && (
        <div className="space-y-2">
          <Label>Image Preview</Label>
          <div className="relative inline-block h-32 w-48 border rounded overflow-hidden">
            <Image
              src={imagePreview || formData.logoUrl}
              alt="Logo preview"
              fill
              className="object-contain"
              sizes="192px"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
        <Input
            id="order"
            type="number"
            value={formData.order}
          onChange={(e) =>
              setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))
          }
            min="1"
        />
      </div>
        <div className="flex items-center space-x-2 pt-6">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving || Object.keys(errors).length > 0}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
          <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : logo ? "Update Client Logo" : "Add Client Logo"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
