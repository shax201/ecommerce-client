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
import { ClientLogoService, type ClientLogoFormData, type ContentResponse } from "@/lib/services/content-service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Types matching backend API
interface ClientLogoData {
  _id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export function ClientLogosManagement() {
  const [clientLogos, setClientLogos] = useState<ClientLogoData[]>([]);
  const [editingLogo, setEditingLogo] = useState<ClientLogoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Load client logos on component mount
  useEffect(() => {
    loadClientLogos();
  }, []);

  const loadClientLogos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ContentResponse = await ClientLogoService.getAll();
      
      if (response.success && response.data) {
        setClientLogos(response.data);
        toast.success("Client logos loaded successfully");
      } else {
        setError(response.message || "Failed to load client logos");
        toast.error(response.message || "Failed to load client logos");
      }
    } catch (error) {
      console.error("Error loading client logos:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load client logos";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (logoData: ClientLogoFormData): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (editingLogo) {
        // Update existing client logo
        const response: ContentResponse = await ClientLogoService.update(editingLogo._id, logoData);
        
        if (response.success && response.data) {
        setClientLogos((prev) =>
            prev.map((logo) => (logo._id === editingLogo._id ? response.data : logo))
        );
        setEditingLogo(null);
        toast.success("Client logo updated successfully");
        } else {
          throw new Error(response.message || "Failed to update client logo");
        }
      } else {
        // Create new client logo
        const response: ContentResponse = await ClientLogoService.create(logoData);
        
        if (response.success && response.data) {
          setClientLogos((prev) => [...prev, response.data]);
        toast.success("Client logo added successfully");
        } else {
          throw new Error(response.message || "Failed to create client logo");
        }
      }
    } catch (error) {
      console.error("Error saving client logo:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save client logo";
      setError(errorMessage);
      toast.error(errorMessage);
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
      setError(null);
      
      const response: ContentResponse = await ClientLogoService.delete(id);
      
      if (response.success) {
        setClientLogos((prev) => prev.filter((logo) => logo._id !== id));
      toast.success("Client logo deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete client logo");
      }
    } catch (error) {
      console.error("Error deleting client logo:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete client logo";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    const logo = clientLogos.find((l) => l._id === id);
    if (!logo) return;

    try {
      setError(null);
      const response: ContentResponse = await ClientLogoService.update(id, {
        isActive: !logo.isActive,
      });
      
      if (response.success && response.data) {
        setClientLogos((prev) => prev.map((l) => (l._id === id ? response.data : l)));
      toast.success("Client logo status updated");
      } else {
        throw new Error(response.message || "Failed to update client logo status");
      }
    } catch (error) {
      console.error("Error toggling client logo status:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update client logo status";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleReorder = async (updates: { id: string; order: number }[]) => {
    try {
      setError(null);
      const response: ContentResponse = await ClientLogoService.reorder({ updates });
      
      if (response.success) {
        // Update local state with new order
        const updatedLogos = [...clientLogos];
        updates.forEach(({ id, order }) => {
          const logo = updatedLogos.find(l => l._id === id);
          if (logo) {
            logo.order = order;
          }
        });
        updatedLogos.sort((a, b) => a.order - b.order);
        setClientLogos(updatedLogos);
        toast.success("Client logos reordered successfully");
      } else {
        throw new Error(response.message || "Failed to reorder client logos");
      }
    } catch (error) {
      console.error("Error reordering client logos:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reorder client logos";
      setError(errorMessage);
      toast.error(errorMessage);
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
    setClientLogos(newLogos.map((logo, index) => ({
      ...logo,
      order: index + 1
    })));

    // Send to backend
    handleReorder(updates);
    setDraggedItem(null);
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.size === clientLogos.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(clientLogos.map(logo => logo._id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} client logo(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkOperating(true);
      setError(null);

      const deletePromises = Array.from(selectedItems).map(id => 
        ClientLogoService.delete(id)
      );

      const results = await Promise.allSettled(deletePromises);
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        setClientLogos(prev => prev.filter(logo => !selectedItems.has(logo._id)));
        setSelectedItems(new Set());
        toast.success(`Successfully deleted ${succeeded} client logo(s)`);
      }

      if (failed > 0) {
        toast.error(`Failed to delete ${failed} client logo(s)`);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete client logos");
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedItems.size === 0) return;

    try {
      setIsBulkOperating(true);
      setError(null);

      const updatePromises = Array.from(selectedItems).map(id => 
        ClientLogoService.update(id, { isActive })
      );

      const results = await Promise.allSettled(updatePromises);
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        setClientLogos(prev => 
          prev.map(logo => 
            selectedItems.has(logo._id) ? { ...logo, isActive } : logo
          )
        );
        setSelectedItems(new Set());
        toast.success(`Successfully ${isActive ? 'activated' : 'deactivated'} ${succeeded} client logo(s)`);
      }

      if (failed > 0) {
        toast.error(`Failed to update ${failed} client logo(s)`);
      }
    } catch (error) {
      console.error("Error in bulk toggle:", error);
      toast.error("Failed to update client logos");
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleDuplicate = async (logo: ClientLogoData) => {
    try {
      setIsSaving(true);
      setError(null);

      const duplicateData: ClientLogoFormData = {
        name: `${logo.name} (Copy)`,
        description: logo.description,
        logoUrl: logo.logoUrl,
        websiteUrl: logo.websiteUrl,
        altText: logo.altText,
        isActive: false, // Duplicated items start as inactive
        order: clientLogos.length + 1
      };

      const response: ContentResponse = await ClientLogoService.create(duplicateData);
      
      if (response.success && response.data) {
        setClientLogos(prev => [...prev, response.data]);
        toast.success("Client logo duplicated successfully");
      } else {
        throw new Error(response.message || "Failed to duplicate client logo");
      }
    } catch (error) {
      console.error("Error duplicating client logo:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to duplicate client logo";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline editing functions
  const startInlineEdit = (id: string, field: string, currentValue: string) => {
    setEditingField({ id, field });
    setEditingValue(currentValue);
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setEditingValue("");
  };

  const saveInlineEdit = async () => {
    if (!editingField) return;

    try {
      setError(null);
      const response: ContentResponse = await ClientLogoService.update(editingField.id, {
        [editingField.field]: editingValue
      });

      if (response.success && response.data) {
        setClientLogos(prev => 
          prev.map(logo => 
            logo._id === editingField.id ? response.data : logo
          )
        );
        toast.success("Updated successfully");
      } else {
        throw new Error(response.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update";
      toast.error(errorMessage);
    } finally {
      setEditingField(null);
      setEditingValue("");
    }
  };

  const handleInlineKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };


  const activeLogos = clientLogos
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
          onClick={loadClientLogos}
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
                onClick={() => setSelectedItems(new Set())}
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
          clientLogos
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
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={handleInlineKeyPress}
                            className="h-8"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveInlineEdit}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelInlineEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded"
                          onClick={() => startInlineEdit(logo._id, 'name', logo.name)}
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
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={handleInlineKeyPress}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveInlineEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelInlineEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted p-1 rounded -ml-1"
                        onClick={() => startInlineEdit(logo._id, 'description', logo.description || '')}
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
