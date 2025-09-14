"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";
import { CONTENT_ISR_TAGS } from "@/lib/isr-tags";

// ===== REVALIDATION FUNCTIONS =====

// Revalidate specific ISR tags
export async function revalidateProducts() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.PRODUCTS);
    revalidateTag(ISR_TAGS.NEW_ARRIVALS);
    revalidateTag(ISR_TAGS.TOP_SELLING);
    console.log("✅ Products cache revalidated");
    return {
      success: true,
      message: "Products cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating products:", error);
    return { success: false, message: "Failed to revalidate products cache" };
  }
}

export async function revalidateContent() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.CONTENT);
    revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    revalidateTag(CONTENT_ISR_TAGS.CLIENT_LOGOS);
    revalidateTag(CONTENT_ISR_TAGS.FOOTER);
    console.log("✅ Content cache revalidated");
    return { success: true, message: "Content cache revalidated successfully" };
  } catch (error) {
    console.error("❌ Error revalidating content:", error);
    return { success: false, message: "Failed to revalidate content cache" };
  }
}

export async function revalidateCompanySettings() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COMPANY_SETTINGS);
    console.log("✅ Company settings cache revalidated");
    return {
      success: true,
      message: "Company settings cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating company settings:", error);
    return {
      success: false,
      message: "Failed to revalidate company settings cache",
    };
  }
}

// Revalidate specific paths
export async function revalidateHomePage() {
  "use server";
  try {
    revalidatePath("/", "page");
    console.log("✅ Home page revalidated");
    return { success: true, message: "Home page revalidated successfully" };
  } catch (error) {
    console.error("❌ Error revalidating home page:", error);
    return { success: false, message: "Failed to revalidate home page" };
  }
}

export async function revalidateShopPage() {
  "use server";
  try {
    revalidatePath("/shop", "page");
    revalidatePath("/shop/(.*)", "page"); // Revalidate all shop subpages
    console.log("✅ Shop pages revalidated");
    return { success: true, message: "Shop pages revalidated successfully" };
  } catch (error) {
    console.error("❌ Error revalidating shop pages:", error);
    return { success: false, message: "Failed to revalidate shop pages" };
  }
}

// Revalidate everything
export async function revalidateAll() {
  "use server";
  try {
    // Revalidate all tags
    await revalidateProducts();
    await revalidateContent();
    await revalidateCompanySettings();
    await revalidateCoupons();

    // Revalidate key paths
    await revalidateHomePage();
    await revalidateShopPage();

    console.log("✅ All cache revalidated");
    return { success: true, message: "All cache revalidated successfully" };
  } catch (error) {
    console.error("❌ Error revalidating all:", error);
    return { success: false, message: "Failed to revalidate all cache" };
  }
}

// ===== WEBHOOK HANDLERS =====

// Handle content updates from backend
export async function handleContentUpdate(contentType: string) {
  "use server";
  try {
    switch (contentType) {
      case "menu":
      case "dynamic-menu":
        revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
        break;
      case "logo":
        revalidateTag(CONTENT_ISR_TAGS.LOGO);
        break;
      case "hero":
      case "hero-section":
        revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
        break;
      case "client-logo":
        revalidateTag(CONTENT_ISR_TAGS.CLIENT_LOGOS);
        break;
      case "footer":
        revalidateTag(CONTENT_ISR_TAGS.FOOTER);
        break;
      default:
        await revalidateContent();
    }

    console.log(`✅ Content cache revalidated (type: ${contentType})`);
    return { success: true, message: "Content cache revalidated successfully" };
  } catch (error) {
    console.error("❌ Error handling content update:", error);
    return { success: false, message: "Failed to handle content update" };
  }
}

// Handle settings updates from backend
export async function handleSettingsUpdate() {
  "use server";
  try {
    await revalidateCompanySettings();
    console.log("✅ Settings cache revalidated");
    return {
      success: true,
      message: "Settings cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling settings update:", error);
    return { success: false, message: "Failed to handle settings update" };
  }
}

// Handle hero sections updates from backend
export async function handleHeroSectionsUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
    console.log("✅ Hero sections cache revalidated");
    return {
      success: true,
      message: "Hero sections cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling hero sections update:", error);
    return { success: false, message: "Failed to handle hero sections update" };
  }
}

// Handle navbar content updates from backend (combines menus, logo, and navbar data)
export async function handleNavbarUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    revalidateTag(CONTENT_ISR_TAGS.NAVBAR);
    console.log("✅ Navbar cache revalidated");
    return { success: true, message: "Navbar cache revalidated successfully" };
  } catch (error) {
    console.error("❌ Error handling navbar update:", error);
    return { success: false, message: "Failed to handle navbar update" };
  }
}

// Handle navigation menu updates specifically
export async function handleNavigationUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
    console.log("✅ Navigation menus cache revalidated");
    return {
      success: true,
      message: "Navigation menus cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling navigation update:", error);
    return { success: false, message: "Failed to handle navigation update" };
  }
}

// Handle footer updates specifically
export async function handleFooterUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.FOOTER);
    console.log("✅ Footer cache revalidated");
    return { success: true, message: "Footer cache revalidated successfully" };
  } catch (error) {
    console.error("❌ Error handling footer update:", error);
    return { success: false, message: "Failed to handle footer update" };
  }
}

// Handle client logos updates specifically
export async function handleClientLogosUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.CLIENT_LOGOS);
    console.log("✅ Client logos cache revalidated");
    return {
      success: true,
      message: "Client logos cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling client logos update:", error);
    return { success: false, message: "Failed to handle client logos update" };
  }
}

// Handle logo updates specifically
export async function handleLogoUpdate(logoId?: string) {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.LOGO);
    if (logoId) {
      revalidateTag(`logo-${logoId}`);
    }
    console.log("✅ Logo cache revalidated");
    return {
      success: true,
      message: "Logo cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling logo update:", error);
    return { success: false, message: "Failed to handle logo update" };
  }
}

// Handle specific product updates
export async function handleProductUpdate(productId?: string) {
  "use server";
  try {
    revalidateTag(ISR_TAGS.PRODUCTS);
    if (productId) {
      revalidateTag(`${ISR_TAGS.PRODUCTS}-${productId}`);
    }
    console.log("✅ Product cache revalidated");
    return {
      success: true,
      message: "Product cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling product update:", error);
    return { success: false, message: "Failed to handle product update" };
  }
}

// Handle all products revalidation
export async function handleAllProductsUpdate() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.PRODUCTS);
    revalidateTag(ISR_TAGS.NEW_ARRIVALS);
    revalidateTag(ISR_TAGS.TOP_SELLING);
    console.log("✅ All products cache revalidated");
    return {
      success: true,
      message: "All products cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling all products update:", error);
    return { success: false, message: "Failed to handle all products update" };
  }
}

// Handle dynamic menus revalidation
export async function handleDynamicMenusUpdate() {
  "use server";
  try {
    revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
    console.log("✅ Dynamic menus cache revalidated");
    return {
      success: true,
      message: "Dynamic menus cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling dynamic menus update:", error);
    return { success: false, message: "Failed to handle dynamic menus update" };
  }
}

// ===== COUPON REVALIDATION FUNCTIONS =====

// Revalidate all coupons
export async function revalidateCoupons() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COUPONS);
    console.log("✅ Coupons cache revalidated");
    return {
      success: true,
      message: "Coupons cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating coupons:", error);
    return { success: false, message: "Failed to revalidate coupons cache" };
  }
}

export async function revalidateOrders() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.ORDERS);
    revalidateTag(ISR_TAGS.USER_ORDERS);
    revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
    revalidateTag(ISR_TAGS.ORDER_TRACKING);
    console.log("✅ Orders cache revalidated");
    return {
      success: true,
      message: "Orders cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating orders:", error);
    return { success: false, message: "Failed to revalidate orders cache" };
  }
}

export async function revalidateOrderAnalytics() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
    console.log("✅ Order analytics cache revalidated");
    return {
      success: true,
      message: "Order analytics cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating order analytics:", error);
    return { success: false, message: "Failed to revalidate order analytics cache" };
  }
}

// Handle coupon updates
export async function handleCouponUpdate(couponId?: string) {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COUPONS);
    if (couponId) {
      revalidateTag(`coupon-${couponId}`);
    }
    console.log("✅ Coupon cache revalidated");
    return {
      success: true,
      message: "Coupon cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling coupon update:", error);
    return { success: false, message: "Failed to handle coupon update" };
  }
}

// Handle coupon creation
export async function handleCouponCreate() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COUPONS);
    console.log("✅ Coupons cache revalidated (new coupon created)");
    return {
      success: true,
      message: "Coupons cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling coupon creation:", error);
    return { success: false, message: "Failed to handle coupon creation" };
  }
}

// Handle coupon deletion
export async function handleCouponDelete(couponId?: string) {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COUPONS);
    if (couponId) {
      revalidateTag(`coupon-${couponId}`);
    }
    console.log("✅ Coupons cache revalidated (coupon deleted)");
    return {
      success: true,
      message: "Coupons cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling coupon deletion:", error);
    return { success: false, message: "Failed to handle coupon deletion" };
  }
}

// Handle bulk coupon operations
export async function handleBulkCouponUpdate(couponIds?: string[]) {
  "use server";
  try {
    revalidateTag(ISR_TAGS.COUPONS);
    if (couponIds && couponIds.length > 0) {
      couponIds.forEach(id => {
        revalidateTag(`coupon-${id}`);
      });
    }
    console.log("✅ Coupons cache revalidated (bulk operation)");
    return {
      success: true,
      message: "Coupons cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error handling bulk coupon update:", error);
    return { success: false, message: "Failed to handle bulk coupon update" };
  }
}
