"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { CONTENT_ISR_TAGS } from "@/lib/isr-tags";

// Redux-integrated hero section actions
// These actions work alongside Redux state management

/**
 * Handle hero section creation with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionCreate(heroSectionId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    revalidateTag(`hero-section-${heroSectionId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Hero section creation handled - ISR cache revalidated");
    return {
      success: true,
      message: "Hero section creation handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero section creation:", error);
    return { success: false, message: "Failed to handle hero section creation" };
  }
}

/**
 * Handle hero section update with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionUpdate(heroSectionId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    revalidateTag(`hero-section-${heroSectionId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Hero section update handled - ISR cache revalidated");
    return {
      success: true,
      message: "Hero section update handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero section update:", error);
    return { success: false, message: "Failed to handle hero section update" };
  }
}

/**
 * Handle hero section deletion with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionDelete(heroSectionId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    revalidateTag(`hero-section-${heroSectionId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Hero section deletion handled - ISR cache revalidated");
    return {
      success: true,
      message: "Hero section deletion handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero section deletion:", error);
    return { success: false, message: "Failed to handle hero section deletion" };
  }
}

/**
 * Handle hero section status toggle with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionStatusToggle(heroSectionId: string) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    revalidateTag(`hero-section-${heroSectionId}`);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Hero section status toggle handled - ISR cache revalidated");
    return {
      success: true,
      message: "Hero section status toggle handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero section status toggle:", error);
    return { success: false, message: "Failed to handle hero section status toggle" };
  }
}

/**
 * Handle hero section reordering with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionReorder() {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ Hero section reordering handled - ISR cache revalidated");
    return {
      success: true,
      message: "Hero section reordering handled successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero section reordering:", error);
    return { success: false, message: "Failed to handle hero section reordering" };
  }
}

/**
 * Handle bulk hero section operations with Redux integration
 * This function should be called after Redux mutations complete
 */
export async function handleHeroSectionBulkOperation(operation: 'delete' | 'update' | 'toggle', count: number) {
  "use server";
  try {
    // Revalidate ISR cache
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log(`✅ Hero section bulk ${operation} handled - ISR cache revalidated`);
    return {
      success: true,
      message: `Hero section bulk ${operation} handled successfully`,
    };
  } catch (error) {
    console.error(`❌ Error handling hero section bulk ${operation}:`, error);
    return { success: false, message: `Failed to handle hero section bulk ${operation}` };
  }
}

/**
 * Bulk revalidate all hero section-related caches
 * Useful for initial data loading or bulk operations
 */
export async function revalidateAllHeroSections() {
  "use server";
  try {
    // Revalidate all hero section-related ISR tags
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    
    // Revalidate admin content page
    revalidatePath("/admin/content");
    
    console.log("✅ All hero section caches revalidated");
    return {
      success: true,
      message: "All hero section caches revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating all hero sections:", error);
    return { success: false, message: "Failed to revalidate all hero section caches" };
  }
}
