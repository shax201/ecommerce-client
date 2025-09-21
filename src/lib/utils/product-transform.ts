import { Product } from "@/types/product.types";

/**
 * Transform API product data to frontend format
 * Handles different API response formats and ensures consistent data structure
 */
export function transformProductData(apiProduct: any): Product {
  if (!apiProduct) {
    throw new Error("Product data is required");
  }

  // Handle different API response formats
  const product = apiProduct.data || apiProduct;

  return {
    id: product.id || product._id,
    title: product.title || "",
    description: product.description || "",
    primaryImage: product.primaryImage || "",
    optionalImages: product.optionalImages || product.gallery || [],
    regularPrice: product.regularPrice || product.price || 0,
    discountPrice: product.discountPrice || 0,
    price: product.regularPrice || product.price || 0,
    discount: {
      amount: product.discount?.amount || 0,
      percentage: product.discount?.percentage || 0,
    },
    rating: product.rating || 0,
    catagory: product.catagory || product.categories || [],
    
    // Transform variants to legacy format for backward compatibility
    variants: {
      color: transformColors(product.colors || product.variants?.color || []),
      size: (product.sizes || product.variants?.size || []).map((s: any) => typeof s === 'string' ? s : s.size || s),
    },
    
    // New direct color and size fields
    colors: transformColors(product.colors || product.variants?.color || []),
    sizes: transformSizes(product.sizes || product.variants?.size || []),
  };
}

/**
 * Transform color data from various API formats to consistent format
 */
function transformColors(colors: any[]): Array<{id: string, name: string, code: string}> {
  if (!Array.isArray(colors)) return [];
  
  return colors.map((color, index) => {
    if (typeof color === 'string') {
      return { id: `color-${index}`, name: color, code: color };
    }
    
    if (typeof color === 'object' && color !== null) {
      return {
        id: color.id || `color-${index}`,
        name: color.name || color.color || color.code || '',
        code: color.code || color.name || color.color || '',
      };
    }
    
    return { id: `color-${index}`, name: '', code: '' };
  }).filter(color => color.name && color.code);
}

/**
 * Transform size data from various API formats to consistent format
 */
function transformSizes(sizes: any[]): Array<{id: string, size: string}> {
  if (!Array.isArray(sizes)) return [];
  
  return sizes.map((size, index) => {
    if (typeof size === 'string') {
      return { id: `size-${index}`, size };
    }
    
    if (typeof size === 'object' && size !== null) {
      return {
        id: size.id || `size-${index}`,
        size: size.size || size.name || '',
      };
    }
    
    return { id: `size-${index}`, size: '' };
  }).filter(size => size.size);
}

/**
 * Get color name for display
 */
export function getColorName(color: {name: string, code: string}): string {
  return color.name || color.code || 'Unknown Color';
}

/**
 * Get size name for display
 */
export function getSizeName(size: {id: string, size: string} | string): string {
  if (typeof size === 'string') {
    return size;
  }
  return size.size || 'Unknown Size';
}

/**
 * Check if product has colors
 */
export function hasColors(product: Product): boolean {
  return !!(product.colors && product.colors.length > 0);
}

/**
 * Check if product has sizes
 */
export function hasSizes(product: Product): boolean {
  return !!(product.sizes && product.sizes.length > 0);
}
