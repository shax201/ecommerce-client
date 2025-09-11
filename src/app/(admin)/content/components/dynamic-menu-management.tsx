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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  Save,
  Eye,
  Loader2,
  RefreshCw,
  Edit,
  X,
  Power,
  Plus,
  Menu,
  ChevronDown,
  GripVertical,
  Link,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDynamicMenus,
  createDynamicMenu,
  updateDynamicMenu,
  deleteDynamicMenu,
  createDynamicMenuItem,
  updateDynamicMenuItem,
  deleteDynamicMenuItem,
  reorderDynamicMenuItems,
  type DynamicMenuFormData,
  type DynamicMenuItemFormData,
  type DynamicMenuFilters,
} from "@/actions/content";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDynamicMenuISR } from "@/hooks/use-dynamic-menu-isr";
import { handleDynamicMenusUpdate } from "@/actions/revalidate";

// Types
type DynamicMenuData = {
  _id?: string;
  name: string;
  description?: string;
  slug: string;
  items: DynamicMenuItemData[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type DynamicMenuItemData = {
  _id?: string;
  id: number;
  label: string;
  url: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  isActive: boolean;
  order: number;
  children?: DynamicMenuItemData[];
  createdAt?: string;
  updatedAt?: string;
};

type CreateDynamicMenuData = {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
};

type CreateDynamicMenuItemData = {
  label: string;
  url: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  isActive?: boolean;
  order?: number;
};

// Sortable Menu Item Component
function SortableMenuItem({
  item,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
}: {
  item: DynamicMenuItemData;
  onEdit: (item: DynamicMenuItemData) => void;
  onDelete: (item: DynamicMenuItemData) => void;
  onToggleActive: (item: DynamicMenuItemData) => void;
  onAddChild: (item: DynamicMenuItemData) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white shadow-sm ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {item.isExternal && (
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                )}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.url}</p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddChild(item)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Child
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(item)}
            className={
              item.isActive
                ? "text-orange-600 hover:text-orange-700"
                : "text-green-600 hover:text-green-700"
            }
          >
            <Power className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {item.children && item.children.length > 0 && (
        <div className="mt-3 ml-8 space-y-2">
          {item.children.map((child) => (
            <div
              key={child.id}
              className="border-l-2 border-gray-200 pl-4 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {child.icon && <span className="text-sm">{child.icon}</span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{child.label}</span>
                      {child.isExternal && (
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          child.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {child.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{child.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(child)}
                    className="text-blue-600 hover:text-blue-700 h-6 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(child)}
                    className={`h-6 px-2 ${
                      child.isActive
                        ? "text-orange-600 hover:text-orange-700"
                        : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    <Power className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(child)}
                    className="text-red-600 hover:text-red-700 h-6 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DynamicMenuManagementProps {
  initialMenus?: any[];
  initialPagination?: any;
}

export function DynamicMenuManagement({
  initialMenus,
  initialPagination,
}: DynamicMenuManagementProps) {
  // Use the custom ISR hook for better data management
  const {
    menus: isrMenus,
    pagination,
    loading,
    error,
    dataSource,
    performanceMetrics,
    loadMore,
    refresh,
  } = useDynamicMenuISR({
    initialMenus: initialMenus || [],
    initialPagination,
  });

  const [menus, setMenus] = useState<DynamicMenuData[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<DynamicMenuData | null>(
    null
  );
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DynamicMenuItemData | null>(
    null
  );
  const [parentItem, setParentItem] = useState<DynamicMenuItemData | null>(
    null
  );

  // Form states
  const [menuForm, setMenuForm] = useState<CreateDynamicMenuData>({
    name: "",
    description: "",
    slug: "",
    isActive: true,
  });

  const [itemForm, setItemForm] = useState<CreateDynamicMenuItemData>({
    label: "",
    url: "",
    description: "",
    icon: "",
    isExternal: false,
    isActive: true,
    order: 1,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load menus (fallback for when ISR data is not available)
  const loadMenus = async () => {
    try {
      const response = await getDynamicMenus();
      if (response.success) {
        setMenus(response.data || []);
      } else {
        toast.error(response.message || "Failed to load menus");
      }
    } catch (error) {
      toast.error("Failed to load menus");
    }
  };

  // Load menus on component mount and when ISR data changes
  useEffect(() => {
    if (isrMenus.length > 0) {
      // Use ISR data if available
      setMenus(isrMenus);
    } else {
      // Fallback to client-side fetching if no ISR data
      loadMenus();
    }
  }, [isrMenus]);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 DynamicMenuManagement ISR Debug:", {
      loading,
      error,
      dataSource,
      performanceMetrics,
      menusCount: menus.length,
    });
  }

  // Menu handlers
  const handleCreateMenu = async () => {
    if (!menuForm.name.trim() || !menuForm.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      const response = await createDynamicMenu(menuForm);
      if (response.success) {
        toast.success("Menu created successfully");
        setIsCreateMenuOpen(false);
        setMenuForm({ name: "", description: "", slug: "", isActive: true });
        loadMenus();

        // Trigger ISR cache revalidation
        await handleDynamicMenusUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create menu");
    }
  };

  const handleEditMenu = async () => {
    if (!selectedMenu || !menuForm.name.trim() || !menuForm.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      const response = await updateDynamicMenu(selectedMenu._id!, menuForm);
      if (response.success) {
        toast.success("Menu updated successfully");
        setIsEditMenuOpen(false);
        setSelectedMenu(null);
        setMenuForm({ name: "", description: "", slug: "", isActive: true });
        loadMenus();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update menu");
    }
  };

  const handleDeleteMenu = async (menu: DynamicMenuData) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;

    try {
      const response = await deleteDynamicMenu(menu._id!);
      if (response.success) {
        toast.success("Menu deleted successfully");
        loadMenus();

        // Trigger ISR cache revalidation
        await handleDynamicMenusUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete menu");
    }
  };

  const handleToggleMenuActive = async (menu: DynamicMenuData) => {
    try {
      const response = await updateDynamicMenu(menu._id!, {
        isActive: !menu.isActive,
      });
      if (response.success) {
        toast.success(`Menu ${!menu.isActive ? "activated" : "deactivated"}`);
        loadMenus();

        // Trigger ISR cache revalidation
        await handleDynamicMenusUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update menu");
    }
  };

  // Item handlers
  const handleCreateItem = async () => {
    if (!selectedMenu || !itemForm.label.trim() || !itemForm.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    try {
      const response = await createDynamicMenuItem(selectedMenu._id!, itemForm);
      if (response.success) {
        toast.success("Menu item created successfully");
        setIsCreateItemOpen(false);
        setItemForm({
          label: "",
          url: "",
          description: "",
          icon: "",
          isExternal: false,
          isActive: true,
          order: 1,
        });
        loadMenus();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create menu item");
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !itemForm.label.trim() || !itemForm.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    try {
      const response = await updateDynamicMenuItem(
        selectedMenu!._id!,
        editingItem.id,
        itemForm
      );
      if (response.success) {
        toast.success("Menu item updated successfully");
        setIsEditItemOpen(false);
        setEditingItem(null);
        setItemForm({
          label: "",
          url: "",
          description: "",
          icon: "",
          isExternal: false,
          isActive: true,
          order: 1,
        });
        loadMenus();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  const handleDeleteItem = async (item: DynamicMenuItemData) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const response = await deleteDynamicMenuItem(selectedMenu!._id!, item.id);
      if (response.success) {
        toast.success("Menu item deleted successfully");
        loadMenus();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const handleToggleItemActive = async (item: DynamicMenuItemData) => {
    try {
      const response = await updateDynamicMenuItem(
        selectedMenu!._id!,
        item.id,
        { isActive: !item.isActive }
      );
      if (response.success) {
        toast.success(
          `Menu item ${!item.isActive ? "activated" : "deactivated"}`
        );
        loadMenus();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  const handleAddChild = (item: DynamicMenuItemData) => {
    setParentItem(item);
    setItemForm({
      label: "",
      url: "",
      description: "",
      icon: "",
      isExternal: false,
      isActive: true,
      order: 1,
    });
    setIsCreateItemOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!selectedMenu || !over || active.id === over.id) return;

    const oldIndex = selectedMenu.items.findIndex(
      (item) => item.id === active.id
    );
    const newIndex = selectedMenu.items.findIndex(
      (item) => item.id === over.id
    );

    const newItems = arrayMove(selectedMenu.items, oldIndex, newIndex);

    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setSelectedMenu({
      ...selectedMenu,
      items: updatedItems,
    });

    try {
      const response = await reorderDynamicMenuItems(selectedMenu._id!, [
        {
          updates: updatedItems.map((item) => ({
            id: item.id.toString(),
            order: item.order,
          })),
        },
      ]);

      if (!response.success) {
        toast.error("Failed to reorder items");
        loadMenus(); // Reload to get correct order
      } else {
        toast.success("Items reordered successfully");
      }
    } catch (error) {
      toast.error("Failed to reorder items");
      loadMenus();
    }
  };

  const openEditMenu = (menu: DynamicMenuData) => {
    setSelectedMenu(menu);
    setMenuForm({
      name: menu.name,
      description: menu.description || "",
      slug: menu.slug,
      isActive: menu.isActive,
    });
    setIsEditMenuOpen(true);
  };

  const openEditItem = (item: DynamicMenuItemData) => {
    setEditingItem(item);
    setItemForm({
      label: item.label,
      url: item.url,
      description: item.description || "",
      icon: item.icon || "",
      isExternal: item.isExternal || false,
      isActive: item.isActive,
      order: item.order,
    });
    setIsEditItemOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Menu List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dynamic Menus</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadMenus} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Menu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Menu</DialogTitle>
                  <DialogDescription>
                    Create a new dynamic menu for your website.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="menu-name">Name *</Label>
                    <Input
                      id="menu-name"
                      value={menuForm.name}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, name: e.target.value })
                      }
                      placeholder="Enter menu name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu-slug">Slug *</Label>
                    <Input
                      id="menu-slug"
                      value={menuForm.slug}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, slug: e.target.value })
                      }
                      placeholder="Enter menu slug (e.g., main-nav)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu-description">Description</Label>
                    <Textarea
                      id="menu-description"
                      value={menuForm.description}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter menu description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="menu-active"
                      checked={menuForm.isActive}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, isActive: e.target.checked })
                      }
                    />
                    <Label htmlFor="menu-active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateMenuOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMenu}>Create Menu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {menus.map((menu) => (
            <Card key={menu._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {menu.name}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          menu.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {menu.isActive ? "Active" : "Inactive"}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {menu.description || "No description"}
                    </CardDescription>
                    <p className="text-sm text-gray-500 mt-1">
                      Slug: {menu.slug} • {menu.items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMenu(menu)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Items
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditMenu(menu)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleMenuActive(menu)}
                      className={
                        menu.isActive
                          ? "text-orange-600 hover:text-orange-700"
                          : "text-green-600 hover:text-green-700"
                      }
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Menu Items Management */}
      {selectedMenu && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Menu Items - {selectedMenu.name}</CardTitle>
                <CardDescription>
                  Manage items for the {selectedMenu.name} menu
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedMenu(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Dialog
                  open={isCreateItemOpen}
                  onOpenChange={setIsCreateItemOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {parentItem
                          ? `Add Child Item to ${parentItem.label}`
                          : "Add Menu Item"}
                      </DialogTitle>
                      <DialogDescription>
                        {parentItem
                          ? `Add a child item under ${parentItem.label}`
                          : "Add a new item to this menu"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="item-label">Label *</Label>
                        <Input
                          id="item-label"
                          value={itemForm.label}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, label: e.target.value })
                          }
                          placeholder="Enter item label"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-url">URL *</Label>
                        <Input
                          id="item-url"
                          value={itemForm.url}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, url: e.target.value })
                          }
                          placeholder="Enter item URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea
                          id="item-description"
                          value={itemForm.description}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter item description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-icon">Icon</Label>
                        <Input
                          id="item-icon"
                          value={itemForm.icon}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, icon: e.target.value })
                          }
                          placeholder="Enter icon (emoji or icon name)"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="item-external"
                            checked={itemForm.isExternal}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                isExternal: e.target.checked,
                              })
                            }
                          />
                          <Label htmlFor="item-external">External Link</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="item-active"
                            checked={itemForm.isActive}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          <Label htmlFor="item-active">Active</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateItemOpen(false);
                          setParentItem(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateItem}>Add Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedMenu.items?.map((item) => item.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {selectedMenu.items?.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      onEdit={openEditItem}
                      onDelete={handleDeleteItem}
                      onToggleActive={handleToggleItemActive}
                      onAddChild={handleAddChild}
                    />
                  ))}
                  {(!selectedMenu.items || selectedMenu.items.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No menu items yet. Click "Add Item" to get started.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* Edit Menu Dialog */}
      <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>Update the menu information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-menu-name">Name *</Label>
              <Input
                id="edit-menu-name"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, name: e.target.value })
                }
                placeholder="Enter menu name"
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-slug">Slug *</Label>
              <Input
                id="edit-menu-slug"
                value={menuForm.slug}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, slug: e.target.value })
                }
                placeholder="Enter menu slug"
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-description">Description</Label>
              <Textarea
                id="edit-menu-description"
                value={menuForm.description}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, description: e.target.value })
                }
                placeholder="Enter menu description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-menu-active"
                checked={menuForm.isActive}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, isActive: e.target.checked })
                }
              />
              <Label htmlFor="edit-menu-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMenu}>Update Menu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the menu item information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-item-label">Label *</Label>
              <Input
                id="edit-item-label"
                value={itemForm.label}
                onChange={(e) =>
                  setItemForm({ ...itemForm, label: e.target.value })
                }
                placeholder="Enter item label"
              />
            </div>
            <div>
              <Label htmlFor="edit-item-url">URL *</Label>
              <Input
                id="edit-item-url"
                value={itemForm.url}
                onChange={(e) =>
                  setItemForm({ ...itemForm, url: e.target.value })
                }
                placeholder="Enter item URL"
              />
            </div>
            <div>
              <Label htmlFor="edit-item-description">Description</Label>
              <Textarea
                id="edit-item-description"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Enter item description"
              />
            </div>
            <div>
              <Label htmlFor="edit-item-icon">Icon</Label>
              <Input
                id="edit-item-icon"
                value={itemForm.icon}
                onChange={(e) =>
                  setItemForm({ ...itemForm, icon: e.target.value })
                }
                placeholder="Enter icon (emoji or icon name)"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-item-external"
                  checked={itemForm.isExternal}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, isExternal: e.target.checked })
                  }
                />
                <Label htmlFor="edit-item-external">External Link</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-item-active"
                  checked={itemForm.isActive}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, isActive: e.target.checked })
                  }
                />
                <Label htmlFor="edit-item-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
