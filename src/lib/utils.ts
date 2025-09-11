import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const compareArrays = (a: any[], b: any[]) => {
  return a.toString() === b.toString();
};

export const title = (str: string | undefined) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
};

export const calculateDiscountPercentage = (
  originalPrice: number,
  discountPrice: number
): number => {
  // Validate input prices
  if (originalPrice <= 0) {
    throw new Error("Original price must be greater than 0.");
  }
  if (discountPrice < 0) {
    throw new Error("Discount price cannot be negative.");
  }
  if (discountPrice > originalPrice) {
    throw new Error("Discount price cannot exceed original price.");
  }

  // Calculate discount percentage
  const discountAmount = originalPrice - discountPrice;
  const discountPercentage = (discountAmount / originalPrice) * 100;

  // Round to 2 decimal places and return
  return Math.round(discountPercentage * 100) / 100;
};
