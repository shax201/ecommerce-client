# ISR (Incremental Static Regeneration) Implementation Guide

This project implements a comprehensive ISR system using Next.js's `unstable_cache`, `revalidateTag`, and `revalidatePath` functions for optimal performance and real-time content updates.

## 🚀 Features

- **Advanced Caching**: Uses `unstable_cache` for intelligent caching with manual invalidation
- **Tag-based Revalidation**: Granular cache control using `revalidateTag`
- **Path-based Revalidation**: Page-level cache invalidation using `revalidatePath`
- **Hybrid Data Loading**: Server-first with client-side fallback mechanisms
- **Error Handling**: Comprehensive error handling with fallbacks
- **Performance Monitoring**: Built-in performance tracking and logging
- **API Integration**: Revalidation endpoints for external systems
- **Admin Panel Integration**: ISR-enabled CRUD operations with automatic cache invalidation
- **Event-Driven Revalidation**: Manual, event-based cache invalidation (no time-based revalidation)

## 📁 File Structure

```
src/
├── actions/
│   ├── products.ts           # Product-related server actions with ISR
│   ├── content.ts            # Content-related server actions with ISR
│   └── revalidate.ts         # Centralized revalidation functions
├── lib/
│   ├── isr-utils.ts          # ISR utilities and helpers
│   └── isr-tags.ts           # Centralized cache tags
├── hooks/
│   ├── use-navbar-isr.tsx    # ISR hook for TopNavbar component
│   ├── use-navbar-management-isr.tsx  # ISR hook for admin navbar management
│   ├── use-footer-isr.tsx    # ISR hook for Footer component
│   ├── use-footer-management-isr.tsx  # ISR hook for admin footer management
│   ├── use-hero-section-management-isr.tsx  # ISR hook for admin hero management
│   ├── use-logo-management-isr.tsx  # ISR hook for admin logo management
│   ├── use-brands-isr.tsx    # ISR hook for Brands component
│   ├── use-shop-isr.tsx      # ISR hook for Shop page
│   ├── use-product-isr.tsx   # ISR hook for Product details
│   ├── use-dynamic-menu-isr.tsx  # ISR hook for admin dynamic menu management
│   └── [other hooks]         # Existing client-side hooks
├── components/
│   ├── layout/
│   │   ├── Navbar/
│   │   │   └── TopNavbar/
│   │   │       └── index.tsx # Optimized TopNavbar with ISR
│   │   └── Footer/
│   │       └── index.tsx     # Optimized Footer with ISR
│   ├── homepage/
│   │   ├── Brands/
│   │   │   └── index.tsx     # ISR-enabled Brands component
│   │   └── Header/
│   │       ├── index.tsx     # ISR-enabled Header component
│   │       └── HeroSlider.tsx # ISR-enabled HeroSlider
│   └── [other components]
├── app/
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts       # Revalidation API endpoint
│   ├── page.tsx               # Home page with ISR data fetching
│   ├── (frontend)/
│   │   ├── home.tsx           # ISR-enabled home page
│   │   ├── shop/
│   │   │   ├── page.tsx       # ISR-enabled shop page
│   │   │   └── ShopClient.tsx # Client component for shop
│   │   └── shop/product/
│   │       └── [...slug]/
│   │           └── page.tsx    # ISR-enabled product page
│   └── (admin)/
│       └── content/
│           └── components/     # All admin components with ISR integration
│               ├── navbar-management.tsx
│               ├── footer-management.tsx
│               ├── hero-section-management.tsx
│               └── logo-management.tsx
└── ISR_README.md              # This documentation
```

## 🏗️ Implementation Overview

### 1. Server Actions with ISR Caching

All server actions now use `unstable_cache` for intelligent caching:

```typescript
// Example from src/actions/products.ts
const fetchNewArrivalsData = unstable_cache(
  async (): Promise<Product[]> => {
    // Fetch logic here
  },
  ["new-arrivals"],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: [ISR_TAGS.NEW_ARRIVALS, ISR_TAGS.PRODUCTS],
  }
);
```

### 2. Cache Tags

Defined cache tags for granular revalidation:

```typescript
// src/lib/isr-tags.ts
export const ISR_TAGS = {
  PRODUCTS: "products",
  NEW_ARRIVALS: "new-arrivals",
  TOP_SELLING: "top-selling",
  COMPANY_SETTINGS: "company-settings",
} as const;

export const CONTENT_ISR_TAGS = {
  DYNAMIC_MENUS: "dynamic-menus",
  LOGO: "logo",
  HERO_SECTIONS: "hero-sections",
  CLIENT_LOGOS: "client-logos",
  FOOTER: "footer",
  CONTENT: "content",
  NAVBAR: "navbar", // Combined navbar data
  NAVIGATION: "navigation", // Navigation-specific
} as const;
```

### 3. TopNavbar ISR Integration

The TopNavbar component has been fully optimized for ISR with:

- **Custom ISR Hook**: `useNavbarISR()` for better data management
- **React.memo Optimization**: Prevents unnecessary re-renders
- **Hybrid Data Loading**: Server-first with client-side fallback
- **Performance Monitoring**: Built-in metrics and debugging

```typescript
// TopNavbar accepts server props with fallback to client hooks
<TopNavbar
  dynamicMenus={serverMenus}  // From ISR
  logo={serverLogo}           // From ISR
/>
```

### 4. Footer ISR Integration

The Footer component has been enhanced with ISR capabilities:

- **Custom ISR Hook**: `useFooterISR()` for better data management
- **React.memo Optimization**: Prevents unnecessary re-renders
- **Hybrid Data Loading**: Server-first with client-side fallback
- **Performance Monitoring**: Built-in metrics and debugging

```typescript
// Footer accepts server props with fallback to client hooks
<Footer
  footerData={serverFooterData}  // From ISR
  clientLogos={serverClientLogos} // From ISR
/>
```

### 5. Revalidation Functions

Use `revalidateTag` and `revalidatePath` for **manual** cache invalidation:

```typescript
// src/actions/revalidate.ts
export async function revalidateProducts() {
  "use server";
  revalidateTag(ISR_TAGS.PRODUCTS);
  revalidateTag(ISR_TAGS.NEW_ARRIVALS);
  revalidateTag(ISR_TAGS.TOP_SELLING);
}

// Content-specific revalidation functions
export async function handleNavbarUpdate() {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
  revalidateTag(CONTENT_ISR_TAGS.LOGO);
  revalidateTag(CONTENT_ISR_TAGS.NAVBAR);
}

export async function handleNavigationUpdate() {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.DYNAMIC_MENUS);
  revalidateTag(CONTENT_ISR_TAGS.NAVIGATION);
}

export async function handleFooterUpdate() {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.FOOTER);
}

export async function handleHeroSectionsUpdate() {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.HERO_SECTIONS);
}

export async function handleClientLogosUpdate() {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.CLIENT_LOGOS);
}

export async function handleLogoUpdate(logoId?: string) {
  "use server";
  revalidateTag(CONTENT_ISR_TAGS.LOGO);
  if (logoId) {
    revalidateTag(`logo-${logoId}`);
  }
}

export async function revalidateHomePage() {
  "use server";
  revalidatePath("/", "page");
}
```

## 🔧 Usage Examples

### Manual Revalidation

```typescript
// Revalidate all products
import { revalidateProducts } from "@/actions/revalidate";
await revalidateProducts();

// Revalidate specific content
import { revalidateContent } from "@/actions/revalidate";
await revalidateContent();

// Revalidate everything
import { revalidateAll } from "@/actions/revalidate";
await revalidateAll();
```

### API-Based Revalidation

Call the revalidation endpoint from external systems:

```bash
# Product-related revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "products", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "product-update", "data": {"productId": "123"}, "secret": "your-secret"}'

# Content-specific revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "navbar-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "navigation-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "footer-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "hero-sections-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "client-logos-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "logo-update", "data": {"logoId": "456"}, "secret": "your-secret"}'

# Revalidate everything
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "all", "secret": "your-secret"}'
```

### Webhook Integration

Set up webhooks in your backend to automatically trigger revalidation:

```typescript
// Example webhook handler in your backend
app.post("/webhooks/content-update", async (req, res) => {
  const { type, data } = req.body;

  // Call Next.js revalidation API
  await fetch("http://your-domain.com/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "content-update",
      data: { contentType: type },
      secret: process.env.REVALIDATION_SECRET,
    }),
  });

  res.json({ success: true });
});
```

## ⚙️ Configuration

### Environment Variables

```env
# Revalidation secret for API security
REVALIDATION_SECRET=your-secret-key-here

# Backend URL for API calls
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

### Next.js Configuration

The `next.config.mjs` includes ISR optimizations:

```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["next/cache"],
  },
  generateBuildId: async () => {
    return "isr-build-" + process.env.NODE_ENV;
  },
};
```

## 📊 Cache Tags

| Content Type      | Tag                | Description           |
| ----------------- | ------------------ | --------------------- |
| **Products**      | `products`         | All product data      |
| New Arrivals      | `new-arrivals`     | New arrival products  |
| Top Selling       | `top-selling`      | Top selling products  |
| **Dynamic Menus** | `dynamic-menus`    | Navigation menus      |
| **Logo**          | `logo`             | Site logo             |
| **Hero Sections** | `hero-sections`    | Homepage hero content |
| **Client Logos**  | `client-logos`     | Client/brand logos    |
| **Footer**        | `footer`           | Footer content        |
| **Navbar**        | `navbar`           | Combined navbar data  |
| Navigation        | `navigation`       | Navigation-specific   |
| Company Settings  | `company-settings` | Site settings         |
| Content           | `content`          | General content tag   |

**Note**: Components marked with **bold** have full ISR integration with both frontend display and admin management.

## 🔍 Debugging

### Cache Status

Check cache status in browser developer tools:

```typescript
// Check if data is from cache or fresh
console.log("🔍 ISR Debug:", {
  usingServerData: dynamicMenus !== undefined,
  cacheStatus: "Check Network tab for cache hits",
});
```

### Performance Monitoring

Monitor ISR performance:

```typescript
import { measureISRPerformance } from "@/lib/isr-utils";

const result = await measureISRPerformance("fetchProducts", async () => {
  return await getNewArrivals();
});
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Network Failures**: Automatic fallback to cached data
- **API Errors**: Graceful degradation with empty arrays/null values
- **Cache Misses**: Fallback to default data structures
- **Logging**: Detailed error logging for debugging

## 🔄 Manual Revalidation

### Event-Based Revalidation

All cache invalidation is now **manual and event-driven** with **no time-based revalidation**. Use revalidation functions when content changes:

```typescript
// After product creation/update/deletion
await handleProductUpdate(productId);

// After navbar/menu updates (admin panel)
await handleNavbarUpdate();

// After navigation menu changes only
await handleNavigationUpdate();

// After footer content updates (admin panel)
await handleFooterUpdate();

// After hero section updates (admin panel)
await handleHeroSectionsUpdate();

// After client logo updates (admin panel)
await handleClientLogosUpdate();

// After logo updates (admin panel)
await handleLogoUpdate(logoId);

// After dynamic menu updates (admin panel)
await handleDynamicMenusUpdate();

// After home page content changes
await revalidatePath("/");
```

### When to Trigger Revalidation

- **Admin Panel Operations**: After any CRUD operation in admin components
- **Content Management**: After creating/updating/deleting content via admin panel
- **Product Updates**: After inventory changes, price updates, or new product launches
- **Settings Changes**: After updating company settings or site configuration
- **Navigation Updates**: After menu structure changes or logo updates
- **Webhook Events**: When receiving updates from external systems
- **API Responses**: After successful backend API calls that modify content

### Admin Component Integration

All admin components now automatically trigger revalidation after successful operations:

```typescript
// Example from navbar-management.tsx
await handleNavbarUpdate(); // Called after create/update/delete operations

// Example from footer-management.tsx
await handleFooterUpdate(); // Called after footer content changes

// Example from hero-section-management.tsx
await handleHeroSectionsUpdate(); // Called after hero section modifications

// Example from logo-management.tsx
await handleLogoUpdate(logoId); // Called after logo operations
```

### API-Based Revalidation Examples

```bash
# Admin panel operations
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "navbar-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "footer-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "hero-sections-update", "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "logo-update", "data": {"logoId": "123"}, "secret": "your-secret"}'

curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "client-logos-update", "secret": "your-secret"}'
```

## 🛠️ Admin Panel ISR Integration

### Fully ISR-Enabled Admin Components

All admin components now have complete ISR integration:

| Component                   | ISR Hook                      | Revalidation Function      | Features                                      |
| --------------------------- | ----------------------------- | -------------------------- | --------------------------------------------- |
| **Navbar Management**       | `useNavbarManagementISR`      | `handleNavbarUpdate`       | Create, update, delete menus/items, reorder   |
| **Footer Management**       | `useFooterManagementISR`      | `handleFooterUpdate`       | Update footer content, sections, links        |
| **Hero Section Management** | `useHeroSectionManagementISR` | `handleHeroSectionsUpdate` | Create, update, delete, reorder hero sections |
| **Logo Management**         | `useLogoManagementISR`        | `handleLogoUpdate`         | Create, update, delete logos                  |
| **Dynamic Menu Management** | `useDynamicMenuISR`           | `handleDynamicMenusUpdate` | Manage dynamic menus and items                |
| **Client Logos Management** | -                             | `handleClientLogosUpdate`  | Manage client/brand logos                     |

### Automatic Cache Revalidation

Every admin CRUD operation automatically triggers appropriate cache revalidation:

```typescript
// Automatic revalidation after admin operations
await handleNavbarUpdate(); // Navbar changes
await handleFooterUpdate(); // Footer changes
await handleLogoUpdate(logoId); // Logo changes
await handleHeroSectionsUpdate(); // Hero section changes
```

### Hybrid Data Loading Pattern

All ISR hooks follow the same pattern:

1. **Server-first**: Use server-provided data when available
2. **Client-fallback**: Fall back to client-side fetching if no server data
3. **Performance tracking**: Built-in metrics and debugging
4. **Error handling**: Graceful degradation with fallbacks

## 📈 Performance Benefits

1. **Faster Load Times**: Pre-rendered pages serve instantly
2. **Reduced Server Load**: Cached responses reduce API calls
3. **SEO Improvement**: Fresh content for search engines
4. **Real-time Updates**: Granular cache invalidation
5. **Error Resilience**: Fallback mechanisms prevent downtime
6. **Admin Efficiency**: Instant cache updates after content changes
7. **Scalability**: Event-driven cache invalidation reduces unnecessary revalidations

## 🔧 Maintenance

### Regular Tasks

1. **Monitor Cache Performance**: Track cache hit rates and manual revalidation usage
2. **Update Cache Tags**: Add new tags for new content types
3. **Review Error Logs**: Monitor for failed revalidations
4. **Implement Proper Triggers**: Ensure all content updates trigger appropriate cache invalidation

### Troubleshooting

**Common Issues:**

1. **Cache not updating**: Check revalidation tags are correct and being called
2. **Stale data**: Ensure manual revalidation is triggered after content updates
3. **API timeouts**: Increase timeout values or implement retries
4. **Memory issues**: Monitor cache size and implement cleanup
5. **Missing revalidation**: Verify that all content update operations call appropriate revalidation functions

**Debug Commands:**

```bash
# Check build ID
curl http://localhost:3000/api/revalidate

# Force revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "all", "secret": "your-secret"}'
```

## 🎯 Best Practices

1. **Use Specific Tags**: Prefer specific tags over broad ones
2. **Monitor Performance**: Track cache hit rates and revalidation times
3. **Handle Errors Gracefully**: Always provide fallbacks
4. **Secure Revalidation**: Use secrets for API endpoints
5. **Test Thoroughly**: Test revalidation in staging environment
6. **Document Changes**: Update cache tags when adding new content

## ✅ Implementation Status

### ✅ Completed Components

| Component Type               | Status            | Notes                                |
| ---------------------------- | ----------------- | ------------------------------------ |
| **TopNavbar**                | ✅ Complete       | ISR hook + React.memo optimization   |
| **Footer**                   | ✅ Complete       | ISR hook + React.memo optimization   |
| **HeroSlider**               | ✅ Complete       | Server props + client fallback       |
| **Brands**                   | ✅ Complete       | ISR hook for client logos            |
| **Shop Page**                | ✅ Complete       | Server component + ISR data fetching |
| **Product Details**          | ✅ Complete       | Server component + ISR data fetching |
| **Admin: Navbar Management** | ✅ Complete       | Full ISR + auto revalidation         |
| **Admin: Footer Management** | ✅ Complete       | Full ISR + auto revalidation         |
| **Admin: Hero Management**   | ✅ Complete       | Full ISR + auto revalidation         |
| **Admin: Logo Management**   | ✅ Complete       | Full ISR + auto revalidation         |
| **Admin: Dynamic Menu**      | ✅ Complete       | Full ISR + auto revalidation         |
| **Cart/Checkout/Account**    | ❌ Not Applicable | Uses Redux store/user auth           |

### 🔧 Key Features Implemented

1. **Comprehensive ISR Coverage**: All major content components have ISR integration
2. **Admin Panel Automation**: All CRUD operations trigger cache revalidation
3. **Hybrid Data Loading**: Server-first with client-side fallback mechanisms
4. **Event-Driven Revalidation**: Manual, event-based cache invalidation only
5. **Performance Monitoring**: Built-in metrics and debugging for all hooks
6. **Error Resilience**: Graceful degradation with fallback mechanisms
7. **API Integration**: Complete revalidation endpoint coverage

### 🚀 Next Steps

1. **Monitor Performance**: Track cache hit rates in production
2. **Add New Components**: Extend ISR to remaining components as needed
3. **Webhook Integration**: Set up backend webhooks for external content updates
4. **Performance Tuning**: Optimize cache strategies based on usage patterns

## 📚 Additional Resources

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [unstable_cache API](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [revalidateTag API](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
