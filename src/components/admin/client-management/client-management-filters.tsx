"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { ClientQuery } from "@/lib/services/client-management-service";

interface ClientManagementFiltersProps {
  searchTerm: string;
  filters: ClientQuery;
  onSearch: (search: string) => void;
  onFiltersChange: (filters: Partial<ClientQuery>) => void;
  onReset: () => void;
}

export function ClientManagementFilters({
  searchTerm,
  filters,
  onSearch,
  onFiltersChange,
  onReset,
}: ClientManagementFiltersProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.status !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status?.toString() || "all"}
          onValueChange={(value) => 
            onFiltersChange({ 
              status: value === "all" ? undefined : value === "true" 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="firstName">First Name</SelectItem>
            <SelectItem value="lastName">Last Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || "desc"}
          onValueChange={(value) => 
            onFiltersChange({ sortOrder: value as "asc" | "desc" })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Active filters:
          </span>
          
          {filters.search && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              Search: "{filters.search}"
              <button
                onClick={() => onFiltersChange({ search: "" })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.status !== undefined && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              Status: {filters.status ? "Active" : "Inactive"}
              <button
                onClick={() => onFiltersChange({ status: undefined })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
