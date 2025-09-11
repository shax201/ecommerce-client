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
import { Upload, Save, Eye, Trash2, Loader2, RefreshCw, GripVertical, AlertCircle, Edit, Check, X, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { HeroSectionService, type HeroSectionFormData, type ContentResponse } from "@/lib/services/content-service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Types matching backend API
interface HeroSectionData {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export function HeroSectionManagement() {
  const [heroSections, setHeroSections] = useState<HeroSectionData[]>([]);
  const [editingHero, setEditingHero] = useState<HeroSectionData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; hero: HeroSectionData | null }>({
    isOpen: false,
    hero: null
  });

  // Load hero sections on component mount
  useEffect(() => {
    loadHeroSections();
  }, []);

  const loadHeroSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ContentResponse = await HeroSectionService.getAll();
      
      if (response.success && response.data) {
        setHeroSections(response.data);
        toast.success("Hero sections loaded successfully");
      } else {
        setError(response.message || "Failed to load hero sections");
        toast.error(response.message || "Failed to load hero sections");
      }
    } catch (error) {
      console.error("Error loading hero sections:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load hero sections";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (heroData: HeroSectionFormData): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (editingHero) {
        // Update existing hero section
        const response: ContentResponse = await HeroSectionService.update(editingHero._id, heroData);
        
        if (response.success && response.data) {
        setHeroSections((prev) =>
            prev.map((hero) => (hero._id === editingHero._id ? response.data : hero))
        );
        setEditingHero(null);
        toast.success("Hero section updated successfully");
        } else {
          throw new Error(response.message || "Failed to update hero section");
        }
      } else {
        // Create new hero section
        const response: ContentResponse = await HeroSectionService.create(heroData);
        
        if (response.success && response.data) {
          setHeroSections((prev) => [...prev, response.data]);
          setIsCreateModalOpen(false);
        toast.success("Hero section added successfully");
        } else {
          throw new Error(response.message || "Failed to create hero section");
        }
      }
    } catch (error) {
      console.error("Error saving hero section:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save hero section";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (hero: HeroSectionData) => {
    setDeleteConfirmModal({ isOpen: true, hero });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.hero) return;

    const { hero } = deleteConfirmModal;
    try {
      setIsDeleting(hero._id);
      setError(null);
      
      const response: ContentResponse = await HeroSectionService.delete(hero._id);
      
      if (response.success) {
        setHeroSections((prev) => prev.filter((h) => h._id !== hero._id));
      toast.success("Hero section deleted successfully");
        setDeleteConfirmModal({ isOpen: false, hero: null });
      } else {
        throw new Error(response.message || "Failed to delete hero section");
      }
    } catch (error) {
      console.error("Error deleting hero section:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete hero section";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, hero: null });
  };

  const handleCreateModalOpen = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleToggleActive = async (id: string) => {
    const hero = heroSections.find((h) => h._id === id);
    if (!hero) return;

    try {
      setError(null);
      const response: ContentResponse = await HeroSectionService.update(id, {
        isActive: !hero.isActive,
      });
      
      if (response.success && response.data) {
        setHeroSections((prev) => prev.map((h) => (h._id === id ? response.data : h)));
      toast.success("Hero section status updated");
      } else {
        throw new Error(response.message || "Failed to update hero section status");
      }
    } catch (error) {
      console.error("Error toggling hero section status:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update hero section status";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // TODO: Implement actual file upload to your storage service
      // For now, we'll use a mock URL
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const mockUrl = URL.createObjectURL(file);
    toast.success("File uploaded successfully");
    return mockUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleReorder = async (updates: { id: string; order: number }[]) => {
    try {
      setError(null);
      const response: ContentResponse = await HeroSectionService.reorder({ updates });
      
      if (response.success) {
        // Update local state with new order
        const updatedSections = [...heroSections];
        updates.forEach(({ id, order }) => {
          const section = updatedSections.find(s => s._id === id);
          if (section) {
            section.order = order;
          }
        });
        updatedSections.sort((a, b) => a.order - b.order);
        setHeroSections(updatedSections);
        toast.success("Hero sections reordered successfully");
      } else {
        throw new Error(response.message || "Failed to reorder hero sections");
      }
    } catch (error) {
      console.error("Error reordering hero sections:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reorder hero sections";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

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

    const draggedIndex = heroSections.findIndex(s => s._id === draggedItem);
    const targetIndex = heroSections.findIndex(s => s._id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Create new order array
    const newSections = [...heroSections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    // Update order values
    const updates = newSections.map((section, index) => ({
      id: section._id,
      order: index + 1
    }));

    // Update local state immediately for better UX
    setHeroSections(newSections.map((section, index) => ({
      ...section,
      order: index + 1
    })));

    // Send to backend
    handleReorder(updates);
    setDraggedItem(null);
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedItems.size === heroSections.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(heroSections.map(hero => hero._id)));
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

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} hero section(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkOperating(true);
      setError(null);

      const deletePromises = Array.from(selectedItems).map(id => 
        HeroSectionService.delete(id)
      );

      const results = await Promise.allSettled(deletePromises);
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        setHeroSections(prev => prev.filter(hero => !selectedItems.has(hero._id)));
        setSelectedItems(new Set());
        toast.success(`Successfully deleted ${succeeded} hero section(s)`);
      }

      if (failed > 0) {
        toast.error(`Failed to delete ${failed} hero section(s)`);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete hero sections");
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
        HeroSectionService.update(id, { isActive })
      );

      const results = await Promise.allSettled(updatePromises);
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        setHeroSections(prev => 
          prev.map(hero => 
            selectedItems.has(hero._id) ? { ...hero, isActive } : hero
          )
        );
        setSelectedItems(new Set());
        toast.success(`Successfully ${isActive ? 'activated' : 'deactivated'} ${succeeded} hero section(s)`);
      }

      if (failed > 0) {
        toast.error(`Failed to update ${failed} hero section(s)`);
      }
    } catch (error) {
      console.error("Error in bulk toggle:", error);
      toast.error("Failed to update hero sections");
    } finally {
      setIsBulkOperating(false);
    }
  };


  const handleBulkReorder = () => {
    const selectedHeroes = heroSections.filter(hero => selectedItems.has(hero._id));
    const startOrder = Math.min(...selectedHeroes.map(h => h.order));
    
    // Create a simple reorder dialog
    const newOrder = prompt(
      `Enter new starting order for ${selectedItems.size} selected items (current: ${startOrder}):`,
      startOrder.toString()
    );
    
    if (newOrder && !isNaN(parseInt(newOrder))) {
      const updates = selectedHeroes.map((hero, index) => ({
        id: hero._id,
        order: parseInt(newOrder) + index
      }));
      
      handleReorder(updates);
      setSelectedItems(new Set());
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
      const response: ContentResponse = await HeroSectionService.update(editingField.id, {
        [editingField.field]: editingValue
      });

      if (response.success && response.data) {
        setHeroSections(prev => 
          prev.map(hero => 
            hero._id === editingField.id ? response.data : hero
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading hero sections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage Hero Sections</h3>
          <p className="text-sm text-muted-foreground">
            Customize your homepage hero section content and images
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHeroSections}
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
      {heroSections.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.size === heroSections.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">
                    Select All ({selectedItems.size}/{heroSections.length})
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
                      variant="outline"
                      size="sm"
                      onClick={handleBulkReorder}
                      disabled={isBulkOperating}
                    >
                      Reorder
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

      <div className="space-y-3">
        {heroSections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No hero sections found. Create your first hero section below.
            </div>
          </div>
        ) : (
          heroSections
            .sort((a, b) => a.order - b.order)
            .map((hero) => (
          <Card 
            key={hero._id} 
            className={`relative transition-all duration-200 ${
              draggedItem === hero._id ? 'opacity-50 scale-95' : ''
            } ${selectedItems.has(hero._id) ? 'ring-2 ring-primary' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, hero._id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, hero._id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.has(hero._id)}
                    onCheckedChange={() => handleSelectItem(hero._id)}
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
                        Order: {hero.order}
                      </span>
                      {editingField?.id === hero._id && editingField?.field === 'title' ? (
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
                          onClick={() => startInlineEdit(hero._id, 'title', hero.title)}
                        >
                    <CardTitle className="text-lg">{hero.title}</CardTitle>
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {editingField?.id === hero._id && editingField?.field === 'subtitle' ? (
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
                        onClick={() => startInlineEdit(hero._id, 'subtitle', hero.subtitle || '')}
                      >
                        <CardDescription className="flex items-center gap-1">
                          {hero.subtitle || 'Click to add subtitle'}
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hero.isActive}
                      onCheckedChange={() => handleToggleActive(hero._id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {hero.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingHero(hero)}
                    title="Edit details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button> */}
                  
                  <Button
                    variant="outline"
                    size="sm"
                      onClick={() => handleDeleteClick(hero)}
                      disabled={isDeleting === hero._id}
                      className="text-destructive hover:text-destructive"
                  >
                      {isDeleting === hero._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                    <Trash2 className="h-4 w-4" />
                      )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {hero.backgroundImage ? (
                    <img
                      src={hero.backgroundImage}
                      alt={hero.backgroundImageAlt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No background image
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <div className="text-sm text-muted-foreground">
                      {hero.description}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Primary Button
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {hero.primaryButtonText} → {hero.primaryButtonLink}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Secondary Button
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {hero.secondaryButtonText} → {hero.secondaryButtonLink}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order</Label>
                    <div className="text-sm text-muted-foreground">
                      {hero.order}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>


      <div className="flex justify-end">
        <Button onClick={handleCreateModalOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Hero Section
        </Button>
      </div>

      {/* Quick Edit Modal */}
      <Dialog open={!!editingHero} onOpenChange={() => setEditingHero(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Edit Hero Section</DialogTitle>
          </DialogHeader>
      {editingHero && (
            <HeroSectionForm
              hero={editingHero}
              onSave={handleSave}
              onCancel={() => setEditingHero(null)}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCreateModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Hero Section</DialogTitle>
          </DialogHeader>
          <HeroSectionForm
            key={isCreateModalOpen ? 'create' : 'edit'}
            onSave={handleSave}
            onCancel={handleCreateModalClose}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmModal.isOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>"{deleteConfirmModal.hero?.title}"</strong>? 
              This action cannot be undone.
            </p>
            {deleteConfirmModal.hero && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Hero Section Details:</div>
                  <div className="text-muted-foreground mt-1">
                    <div>Title: {deleteConfirmModal.hero.title}</div>
                    {deleteConfirmModal.hero.subtitle && (
                      <div>Subtitle: {deleteConfirmModal.hero.subtitle}</div>
                    )}
                    <div>Status: {deleteConfirmModal.hero.isActive ? "Active" : "Inactive"}</div>
                    <div>Order: {deleteConfirmModal.hero.order}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting === deleteConfirmModal.hero?._id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting === deleteConfirmModal.hero?._id}
              >
                {isDeleting === deleteConfirmModal.hero?._id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HeroSectionFormProps {
  hero?: HeroSectionData;
  onSave: (data: HeroSectionFormData) => Promise<void>;
  onCancel?: () => void;
  onFileUpload: (file: File) => Promise<string>;
  isUploading: boolean;
  isSaving?: boolean;
}

function HeroSectionForm({
  hero,
  onSave,
  onCancel,
  onFileUpload,
  isUploading,
  isSaving = false,
}: HeroSectionFormProps) {
  const [formData, setFormData] = useState<HeroSectionFormData>({
    title: hero?.title || "",
    subtitle: hero?.subtitle || "",
    description: hero?.description || "",
    primaryButtonText: hero?.primaryButtonText || "",
    primaryButtonLink: hero?.primaryButtonLink || "",
    secondaryButtonText: hero?.secondaryButtonText || "",
    secondaryButtonLink: hero?.secondaryButtonLink || "",
    backgroundImage: hero?.backgroundImage || "",
    backgroundImageAlt: hero?.backgroundImageAlt || "",
    isActive: hero?.isActive ?? true,
    order: hero?.order || 1,
  });

  // Reset form when hero prop changes (for create vs edit)
  useEffect(() => {
    if (!hero) {
      // This is a create form, reset to default values
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        primaryButtonText: "",
        primaryButtonLink: "",
        secondaryButtonText: "",
        secondaryButtonLink: "",
        backgroundImage: "",
        backgroundImageAlt: "",
        isActive: true,
        order: 1,
      });
      setErrors({});
      setImagePreview(null);
    } else {
      // This is an edit form, populate with hero data
      setFormData({
        title: hero.title,
        subtitle: hero.subtitle || "",
        description: hero.description || "",
        primaryButtonText: hero.primaryButtonText || "",
        primaryButtonLink: hero.primaryButtonLink || "",
        secondaryButtonText: hero.secondaryButtonText || "",
        secondaryButtonLink: hero.secondaryButtonLink || "",
        backgroundImage: hero.backgroundImage || "",
        backgroundImageAlt: hero.backgroundImageAlt || "",
        isActive: hero.isActive,
        order: hero.order,
      });
    }
  }, [hero]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.title.trim().length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (formData.subtitle && formData.subtitle.length > 200) {
      newErrors.subtitle = "Subtitle must be less than 200 characters";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (formData.primaryButtonText && formData.primaryButtonText.length > 50) {
      newErrors.primaryButtonText = "Primary button text must be less than 50 characters";
    }

    if (formData.primaryButtonText && !formData.primaryButtonLink) {
      newErrors.primaryButtonLink = "Primary button link is required when button text is provided";
    }

    if (formData.primaryButtonLink && formData.primaryButtonLink.length > 500) {
      newErrors.primaryButtonLink = "Primary button link must be less than 500 characters";
    }

    if (formData.secondaryButtonText && formData.secondaryButtonText.length > 50) {
      newErrors.secondaryButtonText = "Secondary button text must be less than 50 characters";
    }

    if (formData.secondaryButtonText && !formData.secondaryButtonLink) {
      newErrors.secondaryButtonLink = "Secondary button link is required when button text is provided";
    }

    if (formData.secondaryButtonLink && formData.secondaryButtonLink.length > 500) {
      newErrors.secondaryButtonLink = "Secondary button link must be less than 500 characters";
    }

    if (formData.backgroundImage && formData.backgroundImage.trim()) {
      // Validate URL format
      try {
        new URL(formData.backgroundImage);
      } catch {
        newErrors.backgroundImage = "Background image must be a valid URL";
      }
    }

    if (formData.backgroundImage && formData.backgroundImage.trim() && !formData.backgroundImageAlt?.trim()) {
      newErrors.backgroundImageAlt = "Alt text is required when background image is provided";
    }

    if (formData.backgroundImageAlt && formData.backgroundImageAlt.length > 200) {
      newErrors.backgroundImageAlt = "Background image alt text must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = "Title is required";
        } else if (value.length > 200) {
          newErrors.title = "Title must be less than 200 characters";
        } else {
          delete newErrors.title;
        }
        break;
      case 'subtitle':
        if (value && value.length > 200) {
          newErrors.subtitle = "Subtitle must be less than 200 characters";
        } else {
          delete newErrors.subtitle;
        }
        break;
      case 'description':
        if (value && value.length > 1000) {
          newErrors.description = "Description must be less than 1000 characters";
        } else {
          delete newErrors.description;
        }
        break;
      case 'primaryButtonText':
        if (value && value.length > 50) {
          newErrors.primaryButtonText = "Primary button text must be less than 50 characters";
        } else {
          delete newErrors.primaryButtonText;
        }
        break;
      case 'primaryButtonLink':
        if (formData.primaryButtonText && !value.trim()) {
          newErrors.primaryButtonLink = "Primary button link is required when button text is provided";
        } else if (value && value.length > 500) {
          newErrors.primaryButtonLink = "Primary button link must be less than 500 characters";
        } else {
          delete newErrors.primaryButtonLink;
        }
        break;
      case 'secondaryButtonText':
        if (value && value.length > 50) {
          newErrors.secondaryButtonText = "Secondary button text must be less than 50 characters";
        } else {
          delete newErrors.secondaryButtonText;
        }
        break;
      case 'secondaryButtonLink':
        if (formData.secondaryButtonText && !value.trim()) {
          newErrors.secondaryButtonLink = "Secondary button link is required when button text is provided";
        } else if (value && value.length > 500) {
          newErrors.secondaryButtonLink = "Secondary button link must be less than 500 characters";
        } else {
          delete newErrors.secondaryButtonLink;
        }
        break;
      case 'backgroundImage':
        if (value && value.trim()) {
          try {
            new URL(value);
            delete newErrors.backgroundImage;
          } catch {
            newErrors.backgroundImage = "Background image must be a valid URL";
          }
        } else {
          delete newErrors.backgroundImage;
        }
        break;
      case 'backgroundImageAlt':
        if (formData.backgroundImage && formData.backgroundImage.trim() && !value.trim()) {
          newErrors.backgroundImageAlt = "Alt text is required when background image is provided";
        } else if (value && value.length > 200) {
          newErrors.backgroundImageAlt = "Background image alt text must be less than 200 characters";
        } else {
          delete newErrors.backgroundImageAlt;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      // Clean the form data - remove empty strings for optional fields
      const cleanedFormData: HeroSectionFormData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        primaryButtonText: formData.primaryButtonText?.trim() || undefined,
        primaryButtonLink: formData.primaryButtonLink?.trim() || undefined,
        secondaryButtonText: formData.secondaryButtonText?.trim() || undefined,
        secondaryButtonLink: formData.secondaryButtonLink?.trim() || undefined,
        backgroundImage: formData.backgroundImage?.trim() || undefined,
        backgroundImageAlt: formData.backgroundImageAlt?.trim() || undefined,
        isActive: formData.isActive,
        order: formData.order,
      };

      await onSave(cleanedFormData);
      
      // Only reset form if this is a new hero section (not editing)
    if (!hero) {
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        primaryButtonText: "",
        primaryButtonLink: "",
        secondaryButtonText: "",
        secondaryButtonLink: "",
        backgroundImage: "",
        backgroundImageAlt: "",
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Upload file
      const url = await onFileUpload(file);
      setFormData((prev) => ({ ...prev, backgroundImage: url }));
        
        // Clear preview and use uploaded URL
        setImagePreview(null);
      } catch (error) {
        // Clear preview on error
        setImagePreview(null);
        // Reset file input
        e.target.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, title: value }));
              validateField('title', value);
            }}
            placeholder="Enter hero title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, subtitle: value }));
              validateField('subtitle', value);
            }}
            placeholder="Enter hero subtitle"
            className={errors.subtitle ? "border-red-500" : ""}
          />
          {errors.subtitle && (
            <p className="text-sm text-red-500">{errors.subtitle}</p>
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
          placeholder="Enter hero description"
          rows={3}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryButtonText">Primary Button Text</Label>
          <Input
            id="primaryButtonText"
            value={formData.primaryButtonText}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, primaryButtonText: value }));
              validateField('primaryButtonText', value);
            }}
            placeholder="e.g., Shop Now"
            className={errors.primaryButtonText ? "border-red-500" : ""}
          />
          {errors.primaryButtonText && (
            <p className="text-sm text-red-500">{errors.primaryButtonText}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryButtonLink">Primary Button Link</Label>
          <Input
            id="primaryButtonLink"
            value={formData.primaryButtonLink}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, primaryButtonLink: value }));
              validateField('primaryButtonLink', value);
            }}
            placeholder="e.g., /shop"
            className={errors.primaryButtonLink ? "border-red-500" : ""}
          />
          {errors.primaryButtonLink && (
            <p className="text-sm text-red-500">{errors.primaryButtonLink}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="secondaryButtonText">Secondary Button Text</Label>
          <Input
            id="secondaryButtonText"
            value={formData.secondaryButtonText}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, secondaryButtonText: value }));
              validateField('secondaryButtonText', value);
            }}
            placeholder="e.g., Learn More"
            className={errors.secondaryButtonText ? "border-red-500" : ""}
          />
          {errors.secondaryButtonText && (
            <p className="text-sm text-red-500">{errors.secondaryButtonText}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryButtonLink">Secondary Button Link</Label>
          <Input
            id="secondaryButtonLink"
            value={formData.secondaryButtonLink}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, secondaryButtonLink: value }));
              validateField('secondaryButtonLink', value);
            }}
            placeholder="e.g., /about"
            className={errors.secondaryButtonLink ? "border-red-500" : ""}
          />
          {errors.secondaryButtonLink && (
            <p className="text-sm text-red-500">{errors.secondaryButtonLink}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="backgroundImageAlt">Background Image Alt Text</Label>
        <Input
          id="backgroundImageAlt"
          value={formData.backgroundImageAlt}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, backgroundImageAlt: value }));
            validateField('backgroundImageAlt', value);
          }}
          placeholder="Enter alt text for accessibility"
          className={errors.backgroundImageAlt ? "border-red-500" : ""}
        />
        {errors.backgroundImageAlt && (
          <p className="text-sm text-red-500">{errors.backgroundImageAlt}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload Background Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          <Button type="button" variant="outline" disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: JPEG, PNG, WebP, GIF. Max size: 5MB
        </p>
      </div>

      {/* Image Preview */}
      {(imagePreview || formData.backgroundImage) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Image Preview</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({ ...prev, backgroundImage: "" }));
                setImagePreview(null);
                // Reset file input
                const fileInput = document.getElementById('file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
            >
              Clear Image
            </Button>
          </div>
          <div className="h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={imagePreview || formData.backgroundImage}
              alt="Background preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="backgroundImage">Background Image URL</Label>
        <Input
          id="backgroundImage"
          value={formData.backgroundImage}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, backgroundImage: value }));
            validateField('backgroundImage', value);
          }}
          placeholder="Enter background image URL"
          className={errors.backgroundImage ? "border-red-500" : ""}
        />
        {errors.backgroundImage && (
          <p className="text-sm text-red-500">{errors.backgroundImage}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))
            }
            placeholder="Enter order number"
          />
        </div>
      <div className="flex items-center space-x-2">
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

      {/* Form Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {Object.keys(errors).length > 0 ? (
            <span className="text-red-500">
              {Object.keys(errors).length} error(s) need to be fixed
            </span>
          ) : (
            <span className="text-green-600">Form is valid</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {formData.title ? `${formData.title.length} characters` : "0 characters"}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isUploading || isSaving || Object.keys(errors).length > 0}
          className="flex-1"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
          <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving 
            ? (hero ? "Updating..." : "Adding...") 
            : (hero ? "Update Hero Section" : "Add Hero Section")
          }
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
