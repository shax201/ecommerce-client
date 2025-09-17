"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorsDisplay from "@/components/examples/ColorsDisplay";
import SizesDisplay from "@/components/examples/SizesDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Ruler, Database, Settings } from "lucide-react";

/**
 * Attributes page showing colors and sizes management
 * This demonstrates the complete CRUD operations for product attributes
 */
export default function AttributesPage() {
  const [activeTab, setActiveTab] = useState("colors");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Product Attributes</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Manage your product colors and sizes. These attributes are used throughout your ecommerce store 
            for filtering, product variants, and customer selection.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Colors</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Dynamic</div>
              <p className="text-xs text-muted-foreground">
                Colors loaded from database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sizes</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Dynamic</div>
              <p className="text-xs text-muted-foreground">
                Sizes loaded from database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time data from backend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors Management
            </TabsTrigger>
            <TabsTrigger value="sizes" className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Sizes Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <ColorsDisplay />
            </div>
          </TabsContent>

          <TabsContent value="sizes" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <SizesDisplay />
            </div>
          </TabsContent>
        </Tabs>

        {/* API Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              API Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Colors API Endpoints</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">GET /api/v1/attributes/colors</code> - Get all colors</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">POST /api/v1/attributes/colors/create</code> - Create color(s)</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">PUT /api/v1/attributes/colors/:id</code> - Update color</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">DELETE /api/v1/attributes/colors/:id</code> - Delete color</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sizes API Endpoints</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">GET /api/v1/attributes/sizes</code> - Get all sizes</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">POST /api/v1/attributes/sizes/create</code> - Create size(s)</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">PUT /api/v1/attributes/sizes/:id</code> - Update size</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">DELETE /api/v1/attributes/sizes/:id</code> - Delete size</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">In Product Filters</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Colors and sizes are automatically loaded in the shop filters and can be used to filter products.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <code>
                    {`// Colors are loaded automatically in ColorsSection component
// Sizes are loaded automatically in SizeSection component
// Both components use Redux for state management`}
                  </code>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">In Product Creation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  When creating products, you can select from available colors and sizes.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <code>
                    {`// Use the API hooks in your components
const { data: colors } = useGetColorsQuery();
const { data: sizes } = useGetSizesQuery();`}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
