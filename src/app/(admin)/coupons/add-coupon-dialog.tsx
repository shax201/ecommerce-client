"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, X, AlertCircle, ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Coupon } from "@/types/coupon.types";
import { createCoupon, updateCoupon } from "@/actions/coupons";

interface FormErrors {
  [key: string]: string;
}

interface FormData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscountAmount?: number;
  usageLimit: number;
  validFrom: Date;
  validTo: Date;
  applicableCategories: string[];
  applicableProducts: string[];
  userRestrictions: {
    firstTimeUsersOnly: boolean;
    specificUsers: string[];
    excludeUsers: string[];
  };
}

interface AddCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  couponToEdit?: Coupon | null;
}

export function AddCouponDialog({
  open,
  onOpenChange,
  editMode = false,
  couponToEdit = null,
}: AddCouponDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const getDefaultValidFrom = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getDefaultValidTo = () => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 30); // 30 days from now
    return tomorrow;
  };

  const [formData, setFormData] = useState<FormData>({
    
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minimumOrderValue: 0,
    maximumDiscountAmount: undefined,
    usageLimit: 1,
    validFrom: getDefaultValidFrom(),
    validTo: getDefaultValidTo(),
    applicableCategories: [],
    applicableProducts: [],
    userRestrictions: {
      firstTimeUsersOnly: false,
      specificUsers: [],
      excludeUsers: [],
    },
  });

  // Reset form when dialog opens/closes or edit mode changes
  useEffect(() => {
    if (open) {
      if (editMode && couponToEdit) {
        // Parse dates and normalize them to start of day
        const validFrom = new Date(couponToEdit.validFrom);
        validFrom.setHours(0, 0, 0, 0);
        const validTo = new Date(couponToEdit.validTo);
        validTo.setHours(0, 0, 0, 0);

        setFormData({
          code: couponToEdit.code,
          description: couponToEdit.description,
          discountType: couponToEdit.discountType,
          discountValue: couponToEdit.discountValue,
          minimumOrderValue: couponToEdit.minimumOrderValue,
          maximumDiscountAmount: couponToEdit.maximumDiscountAmount,
          usageLimit: couponToEdit.usageLimit,
          validFrom,
          validTo,
          applicableCategories: couponToEdit.applicableCategories || [],
          applicableProducts: couponToEdit.applicableProducts || [],
          userRestrictions: {
            firstTimeUsersOnly: couponToEdit.userRestrictions?.firstTimeUsersOnly || false,
            specificUsers: couponToEdit.userRestrictions?.specificUsers || [],
            excludeUsers: couponToEdit.userRestrictions?.excludeUsers || [],
          },
        });
      } else {
        setFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          minimumOrderValue: 0,
          maximumDiscountAmount: undefined,
          usageLimit: 1,
          validFrom: getDefaultValidFrom(),
          validTo: getDefaultValidTo(),
          applicableCategories: [],
          applicableProducts: [],
          userRestrictions: {
            firstTimeUsersOnly: false,
            specificUsers: [],
            excludeUsers: [],
          },
        });
      }
      setErrors({});
    }
  }, [open, editMode, couponToEdit]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
    } else if (formData.code.length > 20) {
      newErrors.code = "Coupon code must be at most 20 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Coupon code must contain only letters and numbers";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be at most 500 characters";
    }

    // Discount type validation
    if (!formData.discountType) {
      newErrors.discountType = "Please select a discount type";
    }

    // Discount value validation
    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    } else if (formData.discountValue > 100000) {
      newErrors.discountValue = "Discount value is too high";
    } else if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    // Minimum order value validation
    if (formData.minimumOrderValue < 0) {
      newErrors.minimumOrderValue = "Minimum order value cannot be negative";
    }

    // Maximum discount amount validation (required for percentage)
    if (formData.discountType === 'percentage' && !formData.maximumDiscountAmount) {
      newErrors.maximumDiscountAmount = "Maximum discount amount is required for percentage discounts";
    } else if (formData.maximumDiscountAmount !== undefined && formData.maximumDiscountAmount < 0) {
      newErrors.maximumDiscountAmount = "Maximum discount amount cannot be negative";
    }

    // Usage limit validation
    if (formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    } else if (formData.usageLimit > 10000) {
      newErrors.usageLimit = "Usage limit is too high";
    }

    // Date validation
    if (formData.validFrom && formData.validTo) {
      const validFromDate = new Date(formData.validFrom);
      validFromDate.setHours(0, 0, 0, 0);
      const validToDate = new Date(formData.validTo);
      validToDate.setHours(0, 0, 0, 0);

      if (validToDate <= validFromDate) {
        newErrors.validTo = "Valid to date must be after valid from date";
      }
    } else if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    } else if (!formData.validTo) {
      newErrors.validTo = "Valid to date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form",
      });
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = toast.loading(
        editMode ? "Updating coupon..." : "Creating coupon..."
      );

      const result = editMode && couponToEdit
        ? await updateCoupon(couponToEdit._id, formData)
        : await createCoupon(formData);

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(
          editMode ? "Coupon updated successfully!" : "Coupon created successfully!",
          {
            description: `Coupon "${formData.code}" has been ${editMode ? 'updated' : 'created'}`,
          }
        );
        onOpenChange(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Operation failed", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Error saving coupon", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Normalize dates to start of day
      if (field === 'validFrom' && value instanceof Date) {
        const normalized = new Date(value);
        normalized.setHours(0, 0, 0, 0);
        newData.validFrom = normalized;
      }
      if (field === 'validTo' && value instanceof Date) {
        const normalized = new Date(value);
        normalized.setHours(0, 0, 0, 0);
        newData.validTo = normalized;
      }

      // If validFrom is changed, ensure validTo is still valid
      if (field === 'validFrom' && newData.validFrom && newData.validTo) {
        const validFromDate = new Date(newData.validFrom);
        validFromDate.setHours(0, 0, 0, 0);
        const validToDate = new Date(newData.validTo);
        validToDate.setHours(0, 0, 0, 0);

        if (validToDate <= validFromDate) {
          // Set validTo to the next day after validFrom
          const newValidTo = new Date(validFromDate);
          newValidTo.setDate(newValidTo.getDate() + 1);
          newData.validTo = newValidTo;
        }
      }

      return newData;
    });
  };

  const addCategoryId = (categoryId: string) => {
    if (categoryId && !formData.applicableCategories.includes(categoryId)) {
      setFormData((prev) => ({
        ...prev,
        applicableCategories: [...prev.applicableCategories, categoryId],
      }));
    }
  };

  const removeCategoryId = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.filter(id => id !== categoryId),
    }));
  };

  const addProductId = (productId: string) => {
    if (productId && !formData.applicableProducts.includes(productId)) {
      setFormData((prev) => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, productId],
      }));
    }
  };

  const removeProductId = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(id => id !== productId),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Coupon" : "Add New Coupon"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the coupon details below."
              : "Create a new discount coupon for your customers."
            }
          </DialogDescription>
        </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="SUMMER2025"
                  disabled={editMode}
                  className="font-mono"
                />
                {errors.code && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.code}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {editMode
                    ? "Coupon code cannot be changed after creation"
                    : "Unique code that customers will enter (uppercase letters and numbers only)"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Get 20% off your next purchase"
                  rows={3}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Brief description of the discount offer
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "percentage" | "fixed") =>
                      handleInputChange('discountType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.discountType && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.discountType}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * ({formData.discountType === 'percentage' ? '%' : '$'})
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    step={formData.discountType === 'percentage' ? "0.1" : "0.01"}
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    placeholder={formData.discountType === 'percentage' ? "20" : "10.00"}
                  />
                  {errors.discountValue && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.discountValue}
                    </div>
                  )}
                </div>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maximumDiscountAmount">Maximum Discount Amount ($)</Label>
                  <Input
                    id="maximumDiscountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximumDiscountAmount || ''}
                    onChange={(e) => handleInputChange('maximumDiscountAmount', parseFloat(e.target.value) || undefined)}
                    placeholder="100.00"
                  />
                  {errors.maximumDiscountAmount && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.maximumDiscountAmount}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Maximum amount to deduct even if percentage would be higher
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">Minimum Order Value ($)</Label>
                <Input
                  id="minimumOrderValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderValue}
                  onChange={(e) => handleInputChange('minimumOrderValue', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                {errors.minimumOrderValue && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.minimumOrderValue}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum order total required to use this coupon (0 = no minimum)
                </p>
              </div>
            </div>

            {/* Validity and Usage */}
           {/* Validity and Usage */}
<div className="space-y-4">
  <h3 className="text-lg font-medium">Validity & Usage</h3>

  <div className="grid grid-cols-2 gap-4">
    {/* Valid From */}
    <div className="space-y-2">
      <Label htmlFor="validFrom">Valid From *</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="validFrom"
            className={`w-full justify-between font-normal ${!formData.validFrom && "text-muted-foreground"}`}
          >
            {formData.validFrom ? formData.validFrom.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.validFrom}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                handleInputChange("validFrom", normalized);
              }
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
          />
        </PopoverContent>
      </Popover>
      {errors.validFrom && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errors.validFrom}
        </div>
      )}
    </div>

    {/* Valid To */}
    <div className="space-y-2">
      <Label htmlFor="validTo">Valid To *</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="validTo"
            className={`w-full justify-between font-normal ${!formData.validTo && "text-muted-foreground"}`}
          >
            {formData.validTo ? formData.validTo.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.validTo}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                handleInputChange("validTo", normalized);
              }
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
          />
        </PopoverContent>
      </Popover>
      {errors.validTo && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errors.validTo}
        </div>
      )}
    </div>
  </div>
</div>

          </div>

          {/* User Restrictions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">User Restrictions</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstTimeUsersOnly"
                checked={formData.userRestrictions.firstTimeUsersOnly}
                onCheckedChange={(checked) =>
                  handleInputChange('userRestrictions', {
                    ...formData.userRestrictions,
                    firstTimeUsersOnly: checked as boolean,
                  })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="firstTimeUsersOnly"
                  className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Restrict to first-time users only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only users who have never used any coupon before can use this coupon
                </p>
              </div>
            </div>
          </div>

          {/* Category and Product Restrictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium">Applicable Categories</h4>
              <p className="text-xs text-muted-foreground">
                Leave empty to apply to all categories
              </p>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category ID and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addCategoryId(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        addCategoryId(input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.applicableCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.applicableCategories.map((categoryId) => (
                      <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                        {categoryId}
                        <button
                          type="button"
                          onClick={() => removeCategoryId(categoryId)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium">Applicable Products</h4>
              <p className="text-xs text-muted-foreground">
                Leave empty to apply to all products
              </p>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter product ID and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addProductId(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        addProductId(input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.applicableProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.applicableProducts.map((productId) => (
                      <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                        {productId}
                        <button
                          type="button"
                          onClick={() => removeProductId(productId)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>{editMode ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                editMode ? "Update Coupon" : "Create Coupon"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

