"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { CONTENT_ISR_TAGS } from "@/lib/isr-tags";

// Redux-integrated logo actions
// These actions work alongside Redux state management

/**
 * Handle logo creation with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleLogoCreate(logoId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(`logo-${logoId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Logo creation handled - ISR cache revalidated");
    return {
      success: true,
      message: "Logo creation handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling logo creation:", error);
    return { success: false, message: "Failed to handle logo creation" };
  }
}

/**
 * Handle logo update with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleLogoUpdate(logoId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(`logo-${logoId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Logo update handled - ISR cache revalidated");
    return {
      success: true,
      message: "Logo update handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling logo update:", error);
    return { success: false, message: "Failed to handle logo update" };
  }
}

/**
 * Handle logo deletion with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleLogoDelete(logoId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(`logo-${logoId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Logo deletion handled - ISR cache revalidated");
    return {
      success: true,
      message: "Logo deletion handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling logo deletion:", error);
    return { success: false, message: "Failed to handle logo deletion" };
  }
}

/**
 * Handle logo status toggle with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleLogoStatusToggle(logoId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(`logo-${logoId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Logo status toggle handled - ISR cache revalidated");
    return {
      success: true,
      message: "Logo status toggle handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling logo status toggle:", error);
    return { success: false, message: "Failed to handle logo status toggle" };
  }
}

/**
 * Bulk revalidate all logo-related caches
 * Useful for initial data loading or bulk operations
 */
export async function revalidateAllLogos() {
  "use server";
  try {
    // Revalidate all logo-related ISR tags
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(CONTENT_ISR_TAGS.CLIENT_LOGOS);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ All logo caches revalidated");
    return {
      success: true,
      message: "All logo caches revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating all logos:", error);
    return { success: false, message: "Failed to revalidate all logo caches" };
  }
}
