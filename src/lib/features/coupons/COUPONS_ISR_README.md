# Coupons ISR Implementation

This document explains how ISR (Incremental Static Regeneration) has been implemented for the coupons system in this ecommerce application.

## Overview

ISR allows us to serve static pages with dynamic coupon data that can be updated without rebuilding the entire application. This provides better performance while keeping coupon data fresh and up-to-date.

## Implementation Components

### 1. ISR Actions (`/actions/coupons.ts`)

The following ISR-enabled functions have been added:

- `getCouponsISR(options)` - Fetches all coupons with pagination and filters (1-minute cache)
- `getCouponByIdISR(couponId)` - Fetches single coupon (1-minute cache)
- `getActiveCouponsISR()` - Fetches active coupons (30-second cache)
- `validateCouponISR(validationData)` - Validates coupon (10-second cache)

### 2. ISR Hooks (`/hooks/use-coupons-isr.tsx`)

Custom hooks for managing ISR data:

- `useCouponsISR(initialData)` - Main hook for all coupons data
- `useActiveCouponsISR(initialData)` - Hook for active coupons
- `useSingleCouponISR(couponId, initialData)` - Hook for single coupon
- `useCouponValidationISR(initialData)` - Hook for validation results
- `useCouponsWithPaginationISR(initialData)` - Hook for paginated coupons

### 3. Cache Invalidation

Server actions have been created to handle cache invalidation properly:
- `createCouponWithCacheInvalidation()` - Creates coupon and invalidates cache
- `updateCouponWithCacheInvalidation()` - Updates coupon and invalidates cache
- `activateCouponWithCacheInvalidation()` - Activates coupon and invalidates cache
- `deactivateCouponWithCacheInvalidation()` - Deactivates coupon and invalidates cache
- `deleteCouponWithCacheInvalidation()` - Deletes coupon and invalidates cache

**Note**: Cache invalidation must be done in Server Components/Actions, not in client-side RTK Query mutations.

## Usage Examples

### Server Component (SSR/ISR)

```tsx
import { getCouponsISR, getActiveCouponsISR } from "@/actions/coupons";

export default async function CouponsPage() {
  // Fetch data at build time with ISR
  const couponsData = await getCouponsISR({ page: 1, limit: 10 });
  const activeCouponsData = await getActiveCouponsISR();

  return (
    <div>
      {/* Render coupons */}
    </div>
  );
}

// Enable ISR for this page
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute
```

### Client Component with ISR Hooks

```tsx
"use client";
import { useCouponsISR } from "@/hooks/use-coupons-isr";

export default function CouponsClient({ initialCoupons, initialActiveCoupons }) {
  const {
    couponsData,
    activeCouponsData,
    isLoading,
    hasError,
    dataSource
  } = useCouponsISR({ 
    coupons: initialCoupons, 
    activeCoupons: initialActiveCoupons 
  });

  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <div>Error loading coupons</div>;

  return (
    <div>
      {couponsData.map(coupon => (
        <div key={coupon._id}>
          {/* Render coupon */}
        </div>
      ))}
    </div>
  );
}
```

### Hybrid Approach (Recommended)

```tsx
// Server component fetches initial data
export default async function CouponsPage() {
  const initialCoupons = await getCouponsISR({ page: 1, limit: 10 });
  const initialActiveCoupons = await getActiveCouponsISR();
  
  return (
    <CouponsClient 
      initialCoupons={initialCoupons.data?.coupons} 
      initialActiveCoupons={initialActiveCoupons}
    />
  );
}

// Client component uses ISR hooks for updates
"use client";
function CouponsClient({ initialCoupons, initialActiveCoupons }) {
  const { couponsData, setCouponsData } = useCouponsISR({ 
    coupons: initialCoupons,
    activeCoupons: initialActiveCoupons
  });
  
  // Use RTK Query for real-time updates
  const { data: liveCoupons } = useGetCouponsQuery({ page: 1, limit: 10 });
  
  useEffect(() => {
    if (liveCoupons?.data?.coupons) {
      setCouponsData(liveCoupons.data.coupons);
    }
  }, [liveCoupons, setCouponsData]);
  
  return <div>{/* Render coupons */}</div>;
}
```

### Using Server Actions for Mutations

```tsx
"use client";
import { createCouponWithCacheInvalidation } from "@/actions/coupons";

function CreateCouponForm() {
  const handleSubmit = async (formData) => {
    const result = await createCouponWithCacheInvalidation(formData);
    
    if (result.success) {
      // Coupon created and cache invalidated
      console.log("Coupon created:", result.data);
      // Optionally refresh the page or update local state
      window.location.reload();
    } else {
      console.error("Failed to create coupon:", result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Coupon Validation with ISR

```tsx
"use client";
import { useCouponValidationISR } from "@/hooks/use-coupons-isr";
import { validateCouponISR } from "@/actions/coupons";

function CouponValidationForm() {
  const { validationData, setValidationData } = useCouponValidationISR();

  const handleValidate = async (couponCode: string, orderValue: number) => {
    const result = await validateCouponISR({
      code: couponCode,
      orderValue,
    });
    
    setValidationData(result);
  };

  return (
    <div>
      {/* Validation form */}
      {validationData && (
        <div>
          {validationData.isValid ? (
            <p>Valid coupon! Discount: {validationData.coupon?.discountValue}</p>
          ) : (
            <p>Invalid coupon: {validationData.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Cache Configuration

### Revalidation Times

- **Coupons List**: 60 seconds (moderately changing)
- **Active Coupons**: 30 seconds (more dynamic, needs frequent updates)
- **Single Coupon**: 60 seconds (less frequently changing)
- **Coupon Validation**: 10 seconds (very short cache for real-time validation)

### Cache Tags

- `ISR_TAGS.COUPONS` - General coupons cache
- `coupon-{couponId}` - Individual coupon cache

## Benefits

1. **Performance**: Static pages load faster with cached coupon data
2. **SEO**: Better search engine optimization for coupon pages
3. **Scalability**: Reduced server load for coupon operations
4. **User Experience**: Faster page loads with fresh coupon data
5. **Cost Efficiency**: Lower hosting costs
6. **Real-time Validation**: Fast coupon validation with short cache times

## Best Practices

1. **Use ISR for read-heavy operations** (coupon listings, active coupons)
2. **Combine with RTK Query** for real-time updates
3. **Set appropriate revalidation times** based on data freshness needs
4. **Handle loading and error states** gracefully
5. **Use fallback data** when ISR fails
6. **Cache validation results** for better UX

## Migration Guide

To migrate existing coupon components to use ISR:

1. Replace direct API calls with ISR actions
2. Add ISR hooks for client-side state management
3. Update components to handle initial data from server
4. Implement proper loading and error states
5. Test cache invalidation works correctly
6. Update validation flows to use ISR

## Troubleshooting

### Common Issues

1. **Stale Data**: Check revalidation times and cache invalidation
2. **Build Errors**: Ensure ISR functions are properly exported
3. **Client/Server Mismatch**: Use proper hydration patterns
4. **Cache Not Updating**: Verify cache tags are correct
5. **Validation Issues**: Check validation cache times

### Debug Tools

- Check browser dev tools for cache headers
- Use Next.js build output to verify static generation
- Monitor revalidation logs in production
- Test cache invalidation manually
- Verify coupon validation responses

## Future Enhancements

1. **Edge Caching**: Implement edge-side caching for global performance
2. **Smart Revalidation**: Use webhooks for instant cache updates
3. **A/B Testing**: Implement different cache strategies for testing
4. **Analytics Integration**: Track ISR performance metrics
5. **Coupon Analytics**: Add ISR for coupon usage analytics
6. **Bulk Operations**: Optimize bulk coupon operations with ISR
