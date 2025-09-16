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
  Trash2,
  Save,
  Eye,
  Loader2,
  RefreshCw,
  Edit,
  X,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { useLogoReduxService } from "@/lib/services/logo-redux-service";
import { LogoData, CreateLogoData, UpdateLogoData } from "@/lib/features/logos";
import { useLogoManagementISR } from "@/hooks/use-logo-management-isr";
import { 
  handleLogoCreate, 
  handleLogoUpdate, 
  handleLogoDelete, 
  handleLogoStatusToggle 
} from "@/actions/logo-redux-actions";

interface LogoManagementProps {
  logosData?: LogoData[];
}

export function LogoManagement({ logosData }: LogoManagementProps) {
  // Use Redux service for logo management
  const {
    logos: reduxLogos,
    loading: reduxLoading,
    error: reduxError,
    refetch,
    createLogo: reduxCreateLogo,
    updateLogo: reduxUpdateLogo,
    deleteLogo: reduxDeleteLogo,
    toggleLogoStatus: reduxToggleLogoStatus,
  } = useLogoReduxService();

  // Use the custom ISR hook for better data management
  const {
    logos: isrLogos,
    loading: isLoading,
    error: isrError,
    dataSource,
    performanceMetrics,
  } = useLogoManagementISR({ logosData });

  const [logos, setLogos] = useState<LogoData[]>([]);
  const [editingLogo, setEditingLogo] = useState<LogoData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use Redux data when available, fallback to ISR, then local state
  useEffect(() => {
    if (reduxLogos.length > 0) {
      setLogos(reduxLogos);
    } else if (isrLogos.length > 0) {
      setLogos(isrLogos);
    } else {
      // Fallback to service call if no data available
      loadLogosFallback();
    }
  }, [reduxLogos, isrLogos]);

  // Debug logging for data sources
  useEffect(() => {
    console.log("🔍 LogoManagement Data Sources:", {
      reduxLogos: reduxLogos.length,
      isrLogos: isrLogos.length,
      currentLogos: logos.length,
      dataSource,
      performanceMetrics,
      reduxLoading,
      reduxError,
    });
  }, [reduxLogos, isrLogos, logos, dataSource, performanceMetrics, reduxLoading, reduxError]);

  const loadLogosFallback = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error loading logos:", error);
      toast.error("Failed to load logos");
    }
  };

  const loadLogos = async () => {
    if (reduxLogos.length > 0) {
      setLogos(reduxLogos);
    } else if (isrLogos.length > 0) {
      setLogos(isrLogos);
    } else {
      await loadLogosFallback();
    }
  };

  const handleSave = async (logoData: Partial<LogoData>) => {
    try {
      setIsSaving(true);

      if (editingLogo) {
        // Update existing logo using Redux
        const updateData: UpdateLogoData = {
          name: logoData.name,
          description: logoData.description,
          url: logoData.url,
          altText: logoData.altText,
          type: logoData.type,
          isActive: logoData.isActive,
        };

        const updatedLogo = await reduxUpdateLogo(editingLogo.id, updateData);
        setLogos((prev) =>
          prev.map((logo) => (logo.id === editingLogo.id ? updatedLogo : logo))
        );
        setEditingLogo(null);
        toast.success("Logo updated successfully");

        // Trigger ISR cache revalidation
        await handleLogoUpdate(editingLogo.id);
      } else {
        // Create new logo using Redux
        const createData: CreateLogoData = {
          name: logoData.name || "",
          description: logoData.description || "",
          url: logoData.url || "",
          altText: logoData.altText || "",
          type: logoData.type || "main",
          isActive: logoData.isActive ?? true,
        };

        const newLogo = await reduxCreateLogo(createData);
        setLogos((prev) => [...prev, newLogo]);
        toast.success("Logo added successfully");

        // Trigger ISR cache revalidation
        await handleLogoCreate(newLogo.id);
      }
    } catch (error) {
      console.error("Error saving logo:", error);
      toast.error("Failed to save logo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const logo = logos.find((l) => l.id === id);
    if (!logo) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${logo.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await reduxDeleteLogo(id);
        setLogos((prev) => prev.filter((logo) => logo.id !== id));
        toast.success("Logo deleted successfully");

        // Trigger ISR cache revalidation
        await handleLogoDelete(id);
      } catch (error) {
        console.error("Error deleting logo:", error);
        toast.error("Failed to delete logo");
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const logo = logos.find((l) => l.id === id);
    if (!logo) return;

    try {
      const updatedLogo = await reduxToggleLogoStatus(id, !logo.isActive);
      setLogos((prev) => prev.map((l) => (l.id === id ? updatedLogo : l)));
      toast.success(
        `Logo ${updatedLogo.isActive ? "activated" : "deactivated"} successfully`
      );

      // Trigger ISR cache revalidation
      await handleLogoStatusToggle(id);
    } catch (error) {
      console.error("Error toggling logo status:", error);
      toast.error("Failed to update logo status");
    }
  };

  if (isLoading || reduxLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading logos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage Logos</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage your website logos
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadLogos}
          disabled={isLoading || reduxLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${(isLoading || reduxLoading) ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {logos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              No logos found. Create your first logo below.
            </div>
          </div>
        ) : (
          logos.map((logo) => (
            <Card
              key={logo.id}
              className={`relative ${!logo.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-0 px-1 pt-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xs truncate font-medium">
                      {logo.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-0.5 ml-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(logo.id)}
                      title={
                        logo.isActive ? "Deactivate logo" : "Activate logo"
                      }
                      className={`h-4 w-4 p-0 ${
                        logo.isActive
                          ? "text-green-600 hover:text-green-700"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Power className="h-2 w-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLogo(logo)}
                      title="Edit logo"
                      className="h-4 w-4 p-0"
                    >
                      <Edit className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-1 pb-1">
                <div className="space-y-1">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    {logo.url ? (
                      <img
                        src={logo.url}
                        alt={logo.altText}
                        className="max-h-6 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize truncate">
                      {logo.type}
                    </span>
                    <span
                      className={`inline-flex items-center px-0.5 py-0.5 rounded text-xs ${
                        logo.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {logo.isActive ? "✓" : "○"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {editingLogo && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">
                Edit Logo: {editingLogo.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingLogo(null)}
                title="Close edit form"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LogoForm
              logo={editingLogo}
              onSave={handleSave}
              onCancel={() => setEditingLogo(null)}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      )}

      {/* <Card>
        <CardHeader>
          <CardTitle>Add New Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoForm onSave={handleSave} isSaving={isSaving} />
        </CardContent>
      </Card> */}
    </div>
  );
}

interface LogoFormProps {
  logo?: LogoData;
  onSave: (data: Partial<LogoData>) => void;
  onCancel?: () => void;
  isSaving: boolean;
}

function LogoForm({ logo, onSave, onCancel, isSaving }: LogoFormProps) {
  const [formData, setFormData] = useState({
    name: logo?.name || "",
    description: logo?.description || "",
    url: logo?.url || "",
    altText: logo?.altText || "",
    type: logo?.type || ("main" as const),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!logo) {
      setFormData({
        name: "",
        description: "",
        url: "",
        altText: "",
        type: "main",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter logo name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value as any }))
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="main">Main Logo</option>
            <option value="footer">Footer Logo</option>
            <option value="favicon">Favicon</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter logo description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="altText">Alt Text</Label>
        <Input
          id="altText"
          value={formData.altText}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, altText: e.target.value }))
          }
          placeholder="Enter alt text for accessibility"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Image URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, url: e.target.value }))
          }
          placeholder="Enter image URL (e.g., https://example.com/logo.png)"
          required
        />
        <p className="text-sm text-muted-foreground">
          Enter the full URL to your logo image. Supported formats: JPG, PNG,
          SVG, WebP
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : logo ? "Update Logo" : "Add Logo"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
