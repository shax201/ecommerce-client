"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
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
import { useNavbarManagementISR } from "@/hooks/use-navbar-isr";
import { handleNavbarUpdate } from "@/actions/revalidate";
// Temporary mock types until navbar-service is properly recognized
type NavbarData = {
  _id?: string;
  menus: NavbarMenuData[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type NavbarMenuData = {
  _id?: string;
  id: number;
  label: string;
  type: "MenuItem" | "MenuList";
  url?: string;
  children?: NavbarMenuItemData[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type NavbarMenuItemData = {
  _id?: string;
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type CreateNavbarMenuData = {
  id: number;
  label: string;
  type: "MenuItem" | "MenuList";
  url?: string;
  children?: CreateNavbarMenuItemData[];
  isActive?: boolean;
  order?: number;
};

type CreateNavbarMenuItemData = {
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive?: boolean;
  order?: number;
};

type UpdateNavbarMenuData = {
  label?: string;
  type?: "MenuItem" | "MenuList";
  url?: string;
  children?: CreateNavbarMenuItemData[];
  isActive?: boolean;
  order?: number;
};

type UpdateNavbarMenuItemData = {
  label?: string;
  url?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
};

// Mock navbar service for now
const navbarService = {
  async getNavbar(): Promise<NavbarData | null> {
    // Mock data that matches the current navbar structure
    return {
      _id: "mock-navbar-id",
      menus: [
        {
          id: 1,
          label: "Shop",
          type: "MenuList",
          children: [
            {
              id: 11,
              label: "Men's clothes",
              url: "/shop#men-clothes",
              description: "In attractive and spectacular colors and designs",
              isActive: true,
              order: 1,
            },
            {
              id: 12,
              label: "Women's clothes",
              url: "/shop#women-clothes",
              description: "Ladies, your style and tastes are important to us",
              isActive: true,
              order: 2,
            },
            {
              id: 13,
              label: "Kids clothes",
              url: "/shop#kids-clothes",
              description: "For all ages, with happy and beautiful colors",
              isActive: true,
              order: 3,
            },
            {
              id: 14,
              label: "Bags and Shoes",
              url: "/shop#bag-shoes",
              description: "Suitable for men, women and all tastes and styles",
              isActive: true,
              order: 4,
            },
          ],
          isActive: true,
          order: 1,
        },
        {
          id: 2,
          type: "MenuItem",
          label: "On Sale",
          url: "/shop#on-sale",
          isActive: true,
          order: 2,
        },
        {
          id: 3,
          type: "MenuItem",
          label: "New Arrivals",
          url: "/shop#new-arrivals",
          isActive: true,
          order: 3,
        },
        {
          id: 4,
          type: "MenuItem",
          label: "Brands",
          url: "/shop#brands",
          isActive: true,
          order: 4,
        },
      ],
      isActive: true,
    };
  },

  async updateNavbar(data: NavbarData): Promise<NavbarData | null> {
    console.log("Mock updateNavbar called with:", data);
    return data;
  },

  async addNavbarMenu(
    data: CreateNavbarMenuData | UpdateNavbarMenuData
  ): Promise<NavbarData | null> {
    console.log("Mock addNavbarMenu called with:", data);
    return null;
  },

  async updateNavbarMenu(
    menuId: number,
    data: UpdateNavbarMenuData
  ): Promise<NavbarData | null> {
    console.log("Mock updateNavbarMenu called with:", menuId, data);
    return null;
  },

  async deleteNavbarMenu(menuId: number): Promise<NavbarData | null> {
    console.log("Mock deleteNavbarMenu called with:", menuId);
    return null;
  },

  async addNavbarMenuItem(
    menuId: number,
    data: CreateNavbarMenuItemData | UpdateNavbarMenuItemData
  ): Promise<NavbarData | null> {
    console.log("Mock addNavbarMenuItem called with:", menuId, data);
    // In a real implementation, this would call the API
    // For now, simulate adding the menu item
    return null; // Let the UI handle the state update
  },

  async updateNavbarMenuItem(
    menuId: number,
    menuItemId: number,
    data: UpdateNavbarMenuItemData
  ): Promise<NavbarData | null> {
    console.log(
      "Mock updateNavbarMenuItem called with:",
      menuId,
      menuItemId,
      data
    );
    return null;
  },

  async deleteNavbarMenuItem(
    menuId: number,
    menuItemId: number
  ): Promise<NavbarData | null> {
    console.log("Mock deleteNavbarMenuItem called with:", menuId, menuItemId);
    return null;
  },

  async reorderNavbarMenus(updates: any[]): Promise<NavbarData | null> {
    console.log("Mock reorderNavbarMenus called with:", updates);
    // In a real implementation, this would call the API
    // For now, just return null to let the UI handle the state
    return null;
  },

  async reorderNavbarMenuItems(
    menuId: number,
    updates: any[]
  ): Promise<NavbarData | null> {
    console.log("Mock reorderNavbarMenuItems called with:", menuId, updates);
    // In a real implementation, this would call the API
    // For now, just return null to let the UI handle the state
    return null;
  },
};

// Menu Form Component
function MenuForm({
  menu,
  onSubmit,
  onCancel,
  isSaving,
}: {
  menu?: NavbarMenuData;
  onSubmit: (data: CreateNavbarMenuData | UpdateNavbarMenuData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    id: menu?.id || 0,
    label: menu?.label || "",
    type: menu?.type || ("MenuItem" as "MenuItem" | "MenuList"),
    url: menu?.url || "",
    isActive: menu?.isActive ?? true,
    order: menu?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="id">ID</Label>
        <Input
          id="id"
          type="number"
          value={formData.id}
          onChange={(e) =>
            setFormData({ ...formData, id: parseInt(e.target.value) || 0 })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "MenuItem" | "MenuList") =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MenuItem">Menu Item</SelectItem>
            <SelectItem value="MenuList">Menu List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === "MenuItem" && (
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="/shop"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {menu ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Menu Item Form Component
function MenuItemForm({
  menuItem,
  onSubmit,
  onCancel,
  isSaving,
}: {
  menuItem?: NavbarMenuItemData;
  onSubmit: (data: CreateNavbarMenuItemData | UpdateNavbarMenuItemData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    id: menuItem?.id || 0,
    label: menuItem?.label || "",
    url: menuItem?.url || "",
    description: menuItem?.description || "",
    isActive: menuItem?.isActive ?? true,
    order: menuItem?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="id">ID</Label>
        <Input
          id="id"
          type="number"
          value={formData.id}
          onChange={(e) =>
            setFormData({ ...formData, id: parseInt(e.target.value) || 0 })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description for the menu item"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {menuItem ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface NavbarManagementProps {
  navbarData?: any;
}

export function NavbarManagement({ navbarData }: NavbarManagementProps) {
  // Use the custom ISR hook for better data management
  const {
    navbar: isrNavbar,
    loading: isLoading,
    error: isrError,
    dataSource,
    performanceMetrics,
  } = useNavbarManagementISR({ navbarData });

  const [navbar, setNavbar] = useState<NavbarData | null>(null);
  const [editingMenu, setEditingMenu] = useState<NavbarMenuData | null>(null);
  const [editingMenuItem, setEditingMenuItem] =
    useState<NavbarMenuItemData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load navbar on component mount and when ISR data changes
  useEffect(() => {
    if (isrNavbar) {
      // Use ISR data if available
      setNavbar(isrNavbar);
    } else {
      // Fallback to mock data if no ISR data
      loadNavbar();
    }
  }, [isrNavbar]);

  const loadNavbar = async () => {
    try {
      // Fallback to mock service if no ISR data
      const navbarData = await navbarService.getNavbar();
      setNavbar(navbarData);
    } catch (error) {
      console.error("Error loading navbar:", error);
      toast.error("Failed to load navbar data");
    }
  };

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 NavbarManagement ISR Debug:", {
      isLoading,
      isrError,
      dataSource,
      performanceMetrics,
      hasNavbar: !!navbar,
      menuCount: navbar?.menus?.length || 0,
    });
  }

  const handleSaveNavbar = async () => {
    if (!navbar) return;

    try {
      setIsSaving(true);
      await navbarService.updateNavbar(navbar);
      toast.success("Navbar updated successfully");

      // Trigger ISR cache revalidation
      await handleNavbarUpdate();
    } catch (error) {
      console.error("Error saving navbar:", error);
      toast.error("Failed to save navbar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMenu = async (
    menuData: CreateNavbarMenuData | UpdateNavbarMenuData
  ) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.addNavbarMenu(menuData);

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const newMenu: NavbarMenuData = {
          id: (menuData as CreateNavbarMenuData).id,
          label: (menuData as CreateNavbarMenuData).label,
          type: (menuData as CreateNavbarMenuData).type,
          url: (menuData as CreateNavbarMenuData).url,
          isActive: menuData.isActive ?? true,
          order: menuData.order ?? navbar.menus.length + 1,
          children: ((menuData as CreateNavbarMenuData).children || []).map(
            (child) => ({
              id: child.id,
              label: child.label,
              url: child.url,
              description: child.description,
              isActive: child.isActive ?? true,
              order: child.order ?? 1,
            })
          ),
        };

        setNavbar({ ...navbar, menus: [...navbar.menus, newMenu] });
        toast.success("Menu added successfully");
        setIsMenuDialogOpen(false);

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu added successfully");
        setIsMenuDialogOpen(false);

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      }
    } catch (error) {
      console.error("Error adding menu:", error);
      toast.error("Failed to add menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMenu = async (
    menuId: number,
    menuData: UpdateNavbarMenuData
  ) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.updateNavbarMenu(
        menuId,
        menuData
      );

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const updatedMenus = navbar.menus.map((menu) =>
          menu.id === menuId
            ? {
                ...menu,
                ...(menuData.label && { label: menuData.label }),
                ...(menuData.type && { type: menuData.type }),
                ...(menuData.url !== undefined && { url: menuData.url }),
                ...(menuData.isActive !== undefined && {
                  isActive: menuData.isActive,
                }),
                ...(menuData.order !== undefined && { order: menuData.order }),
                ...(menuData.children && {
                  children: menuData.children.map((child) => ({
                    id: child.id,
                    label: child.label,
                    url: child.url,
                    description: child.description,
                    isActive: child.isActive ?? true,
                    order: child.order ?? 1,
                  })),
                }),
              }
            : menu
        );
        setNavbar({ ...navbar, menus: updatedMenus });
        toast.success("Menu updated successfully");
        setEditingMenu(null);

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu updated successfully");
        setEditingMenu(null);

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      }
    } catch (error) {
      console.error("Error updating menu:", error);
      toast.error("Failed to update menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.deleteNavbarMenu(menuId);

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const updatedMenus = navbar.menus.filter((menu) => menu.id !== menuId);
        setNavbar({ ...navbar, menus: updatedMenus });
        toast.success("Menu deleted successfully");

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu deleted successfully");

        // Trigger ISR cache revalidation
        await handleNavbarUpdate();
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Failed to delete menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMenuItem = async (
    menuId: number,
    menuItemData: CreateNavbarMenuItemData | UpdateNavbarMenuItemData
  ) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.addNavbarMenuItem(
        menuId,
        menuItemData
      );

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const updatedMenus = navbar.menus.map((menu) => {
          if (menu.id === menuId && menu.children) {
            const newMenuItem = {
              ...menuItemData,
              isActive: menuItemData.isActive ?? true,
              order: menuItemData.order ?? menu.children.length + 1,
            } as NavbarMenuItemData;

            return {
              ...menu,
              children: [...menu.children, newMenuItem],
            };
          }
          return menu;
        });

        setNavbar({ ...navbar, menus: updatedMenus });
        toast.success("Menu item added successfully");
        setIsMenuItemDialogOpen(false);
        setSelectedMenuId(null);
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu item added successfully");
        setIsMenuItemDialogOpen(false);
        setSelectedMenuId(null);
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMenuItem = async (
    menuId: number,
    menuItemId: number,
    menuItemData: UpdateNavbarMenuItemData
  ) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.updateNavbarMenuItem(
        menuId,
        menuItemId,
        menuItemData
      );

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const updatedMenus = navbar.menus.map((menu) => {
          if (menu.id === menuId && menu.children) {
            const updatedChildren = menu.children.map((item) =>
              item.id === menuItemId ? { ...item, ...menuItemData } : item
            );
            return { ...menu, children: updatedChildren };
          }
          return menu;
        });
        setNavbar({ ...navbar, menus: updatedMenus });
        toast.success("Menu item updated successfully");
        setEditingMenuItem(null);
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu item updated successfully");
        setEditingMenuItem(null);
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMenuItem = async (menuId: number, menuItemId: number) => {
    try {
      setIsSaving(true);
      const updatedNavbar = await navbarService.deleteNavbarMenuItem(
        menuId,
        menuItemId
      );

      // If the service returns null (mock), update the UI state directly
      if (!updatedNavbar && navbar) {
        const updatedMenus = navbar.menus.map((menu) => {
          if (menu.id === menuId && menu.children) {
            const updatedChildren = menu.children.filter(
              (item) => item.id !== menuItemId
            );
            return { ...menu, children: updatedChildren };
          }
          return menu;
        });
        setNavbar({ ...navbar, menus: updatedMenus });
        toast.success("Menu item deleted successfully");
      } else if (updatedNavbar) {
        setNavbar(updatedNavbar);
        toast.success("Menu item deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMenuActive = (menuId: number) => {
    if (!navbar) return;

    const updatedMenus = navbar.menus.map((menu: NavbarMenuData) =>
      menu.id === menuId ? { ...menu, isActive: !menu.isActive } : menu
    );
    setNavbar({ ...navbar, menus: updatedMenus });
  };

  const toggleMenuItemActive = (menuId: number, menuItemId: number) => {
    if (!navbar) return;

    const updatedMenus = navbar.menus.map((menu: NavbarMenuData) => {
      if (menu.id === menuId && menu.children) {
        const updatedChildren = menu.children.map((item: NavbarMenuItemData) =>
          item.id === menuItemId ? { ...item, isActive: !item.isActive } : item
        );
        return { ...menu, children: updatedChildren };
      }
      return menu;
    });
    setNavbar({ ...navbar, menus: updatedMenus });
  };

  // Drag and drop handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !navbar) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if we're dragging menus
    if (
      activeId.toString().startsWith("menu-") &&
      overId.toString().startsWith("menu-")
    ) {
      const activeIndex = navbar.menus.findIndex(
        (menu) => `menu-${menu.id}` === activeId
      );
      const overIndex = navbar.menus.findIndex(
        (menu) => `menu-${menu.id}` === overId
      );

      if (activeIndex !== overIndex) {
        const newMenus = arrayMove(navbar.menus, activeIndex, overIndex);
        // Update order numbers
        const updatedMenus = newMenus.map((menu, index) => ({
          ...menu,
          order: index + 1,
        }));

        setNavbar({ ...navbar, menus: updatedMenus });

        // Save the new order
        try {
          const updates = updatedMenus.map((menu, index) => ({
            id: menu.id,
            order: index + 1,
          }));
          await navbarService.reorderNavbarMenus([{ updates }]);
          toast.success("Menu order updated successfully");

          // Trigger ISR cache revalidation
          await handleNavbarUpdate();
        } catch (error) {
          console.error("Error reordering menus:", error);
          toast.error("Failed to update menu order");
        }
      }
    }
    // Check if we're dragging menu items
    else if (
      activeId.toString().startsWith("item-") &&
      overId.toString().startsWith("item-")
    ) {
      const activeItemId = parseInt(activeId.toString().replace("item-", ""));
      const overItemId = parseInt(overId.toString().replace("item-", ""));

      // Find which menu contains these items
      const menuWithItems = navbar.menus.find((menu) =>
        menu.children?.some(
          (item) => item.id === activeItemId || item.id === overItemId
        )
      );

      if (menuWithItems && menuWithItems.children) {
        const activeIndex = menuWithItems.children.findIndex(
          (item) => item.id === activeItemId
        );
        const overIndex = menuWithItems.children.findIndex(
          (item) => item.id === overItemId
        );

        if (activeIndex !== overIndex) {
          const newItems = arrayMove(
            menuWithItems.children,
            activeIndex,
            overIndex
          );
          // Update order numbers
          const updatedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1,
          }));

          const updatedMenus = navbar.menus.map((menu) =>
            menu.id === menuWithItems.id
              ? { ...menu, children: updatedItems }
              : menu
          );

          setNavbar({ ...navbar, menus: updatedMenus });

          // Save the new order
          try {
            const updates = updatedItems.map((item, index) => ({
              id: item.id,
              order: index + 1,
            }));
            await navbarService.reorderNavbarMenuItems(menuWithItems.id, [
              { updates },
            ]);
            toast.success("Menu item order updated successfully");

            // Trigger ISR cache revalidation
            await handleNavbarUpdate();
          } catch (error) {
            console.error("Error reordering menu items:", error);
            toast.error("Failed to update menu item order");
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading navbar...</span>
      </div>
    );
  }

  if (!navbar) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No navbar data found</p>
        <Button onClick={loadNavbar} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navbar Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>
                Manage your website's main navigation menu structure
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadNavbar}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSaveNavbar} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
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
              items={navbar.menus.map((menu) => `menu-${menu.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {navbar.menus.map((menu: NavbarMenuData) => (
                  <SortableMenu
                    key={menu.id}
                    menu={menu}
                    onEdit={setEditingMenu}
                    onDelete={handleDeleteMenu}
                    onToggleActive={toggleMenuActive}
                    onAddItem={(menuId) => {
                      setSelectedMenuId(menuId);
                      setIsMenuItemDialogOpen(true);
                    }}
                    onEditItem={setEditingMenuItem}
                    onDeleteItem={handleDeleteMenuItem}
                    onToggleItemActive={toggleMenuItemActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Add Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Menu</DialogTitle>
            <DialogDescription>
              Create a new menu item or menu list for your navigation.
            </DialogDescription>
          </DialogHeader>
          <MenuForm
            onSubmit={handleAddMenu}
            onCancel={() => setIsMenuDialogOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Menu Dialog */}
      {editingMenu && (
        <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Menu</DialogTitle>
              <DialogDescription>Update the menu details.</DialogDescription>
            </DialogHeader>
            <MenuForm
              menu={editingMenu}
              onSubmit={(data) => handleUpdateMenu(editingMenu.id, data)}
              onCancel={() => setEditingMenu(null)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog
        open={isMenuItemDialogOpen}
        onOpenChange={setIsMenuItemDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to the selected menu list.
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm
            onSubmit={(data) =>
              selectedMenuId && handleAddMenuItem(selectedMenuId, data)
            }
            onCancel={() => {
              setIsMenuItemDialogOpen(false);
              setSelectedMenuId(null);
            }}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      {editingMenuItem && (
        <Dialog
          open={!!editingMenuItem}
          onOpenChange={() => setEditingMenuItem(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the menu item details.
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm
              menuItem={editingMenuItem}
              onSubmit={(data) => {
                const menu = navbar.menus.find((m: NavbarMenuData) =>
                  m.children?.some(
                    (item: NavbarMenuItemData) => item.id === editingMenuItem.id
                  )
                );
                if (menu) {
                  handleUpdateMenuItem(menu.id, editingMenuItem.id, data);
                }
              }}
              onCancel={() => setEditingMenuItem(null)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Sortable Menu Component
function SortableMenu({
  menu,
  onEdit,
  onDelete,
  onToggleActive,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItemActive,
}: {
  menu: NavbarMenuData;
  onEdit: (menu: NavbarMenuData) => void;
  onDelete: (menuId: number) => void;
  onToggleActive: (menuId: number) => void;
  onAddItem: (menuId: number) => void;
  onEditItem: (item: NavbarMenuItemData) => void;
  onDeleteItem: (menuId: number, itemId: number) => void;
  onToggleItemActive: (menuId: number, itemId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `menu-${menu.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {menu.label}
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {menu.type}
                  </span>
                </h3>
                {menu.url && (
                  <p className="text-sm text-muted-foreground">{menu.url}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(menu)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(menu.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(menu.id)}
                className={menu.isActive ? "text-green-600" : "text-gray-400"}
              >
                <Power className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {menu.type === "MenuList" && menu.children && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Menu Items ({menu.children.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddItem(menu.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <SortableMenuItems
                menuId={menu.id}
                items={menu.children}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onToggleActive={onToggleItemActive}
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Sortable Menu Items Component
function SortableMenuItems({
  menuId,
  items,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  menuId: number;
  items: NavbarMenuItemData[];
  onEdit: (item: NavbarMenuItemData) => void;
  onDelete: (menuId: number, itemId: number) => void;
  onToggleActive: (menuId: number, itemId: number) => void;
}) {
  return (
    <SortableContext
      items={items.map((item) => `item-${item.id}`)}
      strategy={verticalListSortingStrategy}
    >
      <div className="space-y-1">
        {items.map((item) => (
          <SortableMenuItem
            key={item.id}
            menuId={menuId}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </SortableContext>
  );
}

// Sortable Menu Item Component
function SortableMenuItem({
  menuId,
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  menuId: number;
  item: NavbarMenuItemData;
  onEdit: (item: NavbarMenuItemData) => void;
  onDelete: (menuId: number, itemId: number) => void;
  onToggleActive: (menuId: number, itemId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.url}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(menuId, item.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleActive(menuId, item.id)}
          className={item.isActive ? "text-green-600" : "text-gray-400"}
        >
          <Power className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
