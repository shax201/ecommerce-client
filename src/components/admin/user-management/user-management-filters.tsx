"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { UserQuery } from "@/lib/services/user-management-service";
import { setFilters, resetFilters } from "@/lib/features/user-management";

interface UserManagementFiltersProps {
  filters: UserQuery;
  onFilterChange: (filters: Partial<UserQuery>) => void;
}

export function UserManagementFilters({
  filters,
  onFilterChange,
}: UserManagementFiltersProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Partial<UserQuery>>(filters);

  // Sync local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof UserQuery, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    dispatch(setFilters({ ...filters, ...localFilters, page: 1 }));
    onFilterChange({ ...localFilters, page: 1 });
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      search: "",
      role: undefined,
      status: undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    };
    dispatch(resetFilters());
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setIsOpen(false);
  };

  const handleClearFilter = (key: keyof UserQuery) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key as keyof UserQuery] !== undefined && 
      localFilters[key as keyof UserQuery] !== null &&
      localFilters[key as keyof UserQuery] !== ''
    ).length;
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Search Input */}
      <div className="flex-1 max-w-sm">
        <Input
          placeholder="Search users..."
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApplyFilters();
            }
          }}
          className="w-full"
        />
      </div>

      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={localFilters.role || ''}
                onValueChange={(value) => handleFilterChange('role', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.role && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('role')}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear role
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.status && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('status')}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear status
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={localFilters.sortBy || 'createdAt'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Select
                value={localFilters.sortOrder || 'desc'}
                onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items per page</Label>
              <Select
                value={localFilters.limit?.toString() || '10'}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}