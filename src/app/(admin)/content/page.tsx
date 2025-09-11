"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Image, Layout, Users, ExternalLink, Sparkles, Zap, Menu, List, Globe } from "lucide-react";
import { LogoManagement } from "./components/logo-management";
import { HeroSectionManagement } from "./components/hero-section-management";
import { ClientLogosManagement } from "./components/client-logos-management";
import { FooterManagement } from "./components/footer-management";
import { NavbarManagement } from "./components/navbar-management";
import { DynamicMenuManagement } from "./components/dynamic-menu-management";
import FaviconManager from "@/components/favicon/FaviconManager";
import "./components/animated-button.css";

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Website Content Management
            </h1>
            <p className="text-muted-foreground">
              Manage your website's frontend content including logos, hero sections,
              client logos, navbar, and footer.
            </p>
          </div>
          
          {/* Animated View Website Button */}
          <div className="relative group">
            <Button
              size="lg"
              className="animated-button relative overflow-hidden text-white font-bold px-6 py-3 lg:px-8 lg:py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 border-2 border-white/20 w-full sm:w-auto"
              onClick={() => window.open('/', '_blank')}
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              
              {/* Sparkle effects with custom animations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full floating-particle"></div>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-300 rounded-full floating-particle"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full floating-particle"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-300 rounded-full floating-particle"></div>
              
              {/* Additional sparkles */}
              <div className="absolute top-1 left-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-100"></div>
              <div className="absolute top-1 right-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-1 left-1/3 w-2 h-2 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-1 right-1/3 w-2 h-2 bg-white rounded-full animate-ping delay-75"></div>
              
              {/* Button content */}
              <div className="relative flex items-center gap-2 lg:gap-3 z-10">
                <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 sparkle-icon text-yellow-200" />
                <span className="relative text-base lg:text-lg font-extrabold tracking-wide dancing-text">
                  View Website
                </span>
                <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5 animate-pulse text-blue-200" />
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
            </Button>
            
            {/* Enhanced floating particles effect with dancing */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-100 dancing-element"></div>
            <div className="absolute -top-2 -right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-200 dancing-element"></div>
            <div className="absolute -bottom-3 -left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300 dancing-element"></div>
            <div className="absolute -bottom-2 -right-3 w-2 h-2 bg-green-400 rounded-full animate-ping delay-75 dancing-element"></div>
            
            {/* Additional dancing elements */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full dancing-element"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full dancing-element"></div>
            <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full dancing-element"></div>
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-2 h-2 bg-rose-400 rounded-full dancing-element"></div>
            
            {/* Fun hover text with enhanced dancing animation */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300">
              <div className="hover-tooltip bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-full whitespace-nowrap shadow-lg border-2 border-white/20 dancing-text">
                🚀 Let's dance to the magic! ✨💃
              </div>
            </div>
            
            {/* Additional floating elements with dancing */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-500">
              <div className="text-2xl animate-bounce dancing-element">🌟</div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-700">
              <div className="text-xl animate-bounce dancing-element">💫</div>
            </div>
            <div className="absolute -top-8 left-1/4 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
              <div className="text-lg animate-bounce dancing-element">🎉</div>
            </div>
            <div className="absolute -bottom-8 right-1/4 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-900">
              <div className="text-lg animate-bounce dancing-element">🎊</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo
          </TabsTrigger>
          
          <TabsTrigger value="favicon" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Favicon
          </TabsTrigger>
          
          <TabsTrigger value="dynamic-menu" className="flex items-center gap-2">
            <List className="h-4 w-4" />
             Navbar
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Logos
          </TabsTrigger>

          {/* <TabsTrigger value="navbar" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Navbar
          </TabsTrigger> */}
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Footer
          </TabsTrigger>

        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Management</CardTitle>
              <CardDescription>
                Upload and manage your ecommerce logo and brand assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favicon" className="space-y-6">
          <FaviconManager />
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Management</CardTitle>
              <CardDescription>
                Customize your homepage hero section content and images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSectionManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Logos Management</CardTitle>
              <CardDescription>
                Manage client logos and brand partnerships displayed on your
                website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientLogosManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navbar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navbar Management</CardTitle>
              <CardDescription>
                Manage your website's navigation menu structure and menu items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NavbarManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Management</CardTitle>
              <CardDescription>
                Customize footer content, links, and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FooterManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic-menu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Menu Management</CardTitle>
              <CardDescription>
                Create and manage dynamic menus that can be used throughout your website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicMenuManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
