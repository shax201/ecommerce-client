"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store";
import { 
  useGetLogosQuery, 
  useCreateLogoMutation, 
  useUpdateLogoMutation 
} from "@/lib/features/logos/logosApi";
import { 
  selectFavicon, 
  selectFaviconLoading, 
  selectFaviconError 
} from "@/lib/features/logos/logosSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Check, X, Globe } from "lucide-react";
import { toast } from "sonner";

export default function FaviconManager() {
  // Redux selectors
  const favicon = useAppSelector(selectFavicon);
  const loading = useAppSelector(selectFaviconLoading);
  const error = useAppSelector(selectFaviconError);
  
  // RTK Query hooks
  const { 
    data: logosData, 
    isLoading: logosLoading, 
    error: logosError,
    refetch: refetchLogos 
  } = useGetLogosQuery();
  
  const [createLogo, { isLoading: isCreating }] = useCreateLogoMutation();
  const [updateLogo, { isLoading: isUpdating }] = useUpdateLogoMutation();

  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle");

  // Function to update the favicon in the DOM
  const updateFaviconInDOM = (url: string, altText?: string) => {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    link.type = 'image/x-icon';
    if (altText) {
      link.setAttribute('alt', altText);
    }
    
    document.head.appendChild(link);

    // Also update apple-touch-icon for iOS devices
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', url);
    } else {
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);
    }
  };

  // Update DOM when favicon changes
  useEffect(() => {
    if (favicon?.url) {
      updateFaviconInDOM(favicon.url, favicon.altText);
    }
  }, [favicon]);

  const handleUpdate = async () => {
    if (!url.trim()) {
      setUpdateStatus("error");
      return;
    }

    setUpdateStatus("idle");

    try {
      if (favicon) {
        // Update existing favicon
        await updateLogo({
          id: favicon.id,
          data: {
            url: url.trim(),
            altText: altText.trim() || favicon.altText,
          }
        }).unwrap();
        toast.success("Favicon updated successfully!");
      } else {
        // Create new favicon
        await createLogo({
          name: "Website Favicon",
          description: "Browser tab icon",
          url: url.trim(),
          altText: altText.trim() || "Website Favicon",
          type: "favicon",
          isActive: true,
        }).unwrap();
        toast.success("Favicon created successfully!");
      }
      
      setUpdateStatus("success");
      setUrl("");
      setAltText("");
      
      // Refetch logos to update the store
      refetchLogos();
      
      // Update DOM immediately
      updateFaviconInDOM(url.trim(), altText.trim());
      
      // Refresh the page to reload the favicon
      window.location.reload();
    } catch (err) {
      setUpdateStatus("error");
      toast.error("Failed to update favicon");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL for the uploaded file
      const tempUrl = URL.createObjectURL(file);
      setUrl(tempUrl);
      
      // Extract filename without extension for alt text
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setAltText(filename);
    }
  };

  const isLoading = loading || logosLoading || isCreating || isUpdating;
  const hasError = error || (logosError ? 'Failed to fetch favicon' : null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading favicon...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Favicon Management
        </CardTitle>
        <CardDescription>
          Update your website's favicon (browser tab icon) using the existing logo management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasError && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{hasError}</AlertDescription>
          </Alert>
        )}

        {updateStatus === "success" && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>Favicon updated successfully! The page will refresh to apply changes.</AlertDescription>
          </Alert>
        )}

        {updateStatus === "error" && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>Failed to update favicon. Please try again.</AlertDescription>
          </Alert>
        )}

        {favicon && (
          <div className="space-y-2">
            <Label>Current Favicon</Label>
            <div className="flex items-center space-x-4">
              <img 
                src={favicon.url} 
                alt={favicon.altText}
                className="w-8 h-8 object-contain border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm font-medium">{favicon.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {favicon.url}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="favicon-url">Favicon URL</Label>
            <Input
              id="favicon-url"
              type="url"
              placeholder="https://example.com/favicon.ico"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon-alt">Alt Text (optional)</Label>
            <Input
              id="favicon-alt"
              type="text"
              placeholder="Website favicon"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon-file">Or upload a file</Label>
            <Input
              id="favicon-file"
              type="file"
              accept="image/x-icon,image/png,image/svg+xml"
              onChange={handleFileUpload}
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={isLoading || !url.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {favicon ? "Update Favicon" : "Create Favicon"}
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Supported formats:</strong> ICO, PNG, SVG</p>
          <p><strong>Recommended size:</strong> 32x32 pixels or 16x16 pixels</p>
          <p><strong>Note:</strong> Changes will be applied after page refresh</p>
        </div>
      </CardContent>
    </Card>
  );
}
