"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface OrdersBreadcrumbProps {
  currentPage: string;
  showBackButton?: boolean;
}

export function OrdersBreadcrumb({ currentPage, showBackButton = true }: OrdersBreadcrumbProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link href="/admin/orders" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4 mr-1" />
        Orders
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">{currentPage}</span>
      {showBackButton && (
        <div className="ml-auto">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
