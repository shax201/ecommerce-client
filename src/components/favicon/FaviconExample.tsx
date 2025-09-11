"use client";

import { useState } from "react";
import { useFavicon } from "@/hooks/use-favicon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Globe, Check, X } from "lucide-react";

/**
 * Example component demonstrating how to use the favicon system
 * This shows the current favicon and provides quick test options
 */
export default function FaviconExample() {
  const { favicon, loading, error } = useFavicon();

  // Predefined favicon options for quick testing
  const predefinedFavicons = [
    {
      name: "Default",
      url: "/favicon.ico",
      description: "Original favicon",
    },
    {
      name: "Emoji Heart",
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>",
      description: "Heart emoji favicon",
    },
    {
      name: "Emoji Star",
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>",
      description: "Star emoji favicon",
    },
    {
      name: "Emoji Rocket",
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
      description: "Rocket emoji favicon",
    },
  ];

  const handleTestFavicon = (url: string) => {
    // This would typically update the favicon via the admin interface
    // For demo purposes, we'll just show an alert
    alert(
      `To change favicon to: ${url}\n\nGo to Admin Panel > Content > Favicon tab to update it!`
    );
  };

  if (loading) {
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
          Favicon Example
        </CardTitle>
        <CardDescription>
          Current favicon status and quick test options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {favicon ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Favicon</h4>
            <div className="flex items-center space-x-3">
              <img
                src={favicon.url}
                alt={favicon.altText}
                className="w-8 h-8 object-contain border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
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
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No favicon configured
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to Admin Panel &gt; Content &gt; Favicon to set one up
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Test Options</h4>
          <div className="grid grid-cols-2 gap-2">
            {predefinedFavicons.map((fav, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleTestFavicon(fav.url)}
                className="justify-start"
              >
                {fav.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            <strong>How to change favicon:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to Admin Panel → Content → Favicon tab</li>
            <li>Upload a file or enter a URL</li>
            <li>Click "Update Favicon"</li>
            <li>Refresh the page to see changes</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
