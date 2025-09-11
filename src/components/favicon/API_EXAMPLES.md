# Favicon API Call Examples

Here are different ways to call the API to show favicon in your root component:

## 1. Current Setup (Using Hook - Recommended)

```tsx
// In layout.tsx
import FaviconProvider from "@/components/favicon/FaviconProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <FaviconProvider />  {/* Uses useFavicon hook */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 2. Direct API Call Component

```tsx
// In layout.tsx
import FaviconLoader from "@/components/favicon/FaviconLoader";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <FaviconLoader />  {/* Direct API call */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 3. Most Direct API Call

```tsx
// In layout.tsx
import DirectFaviconLoader from "@/components/favicon/DirectFaviconLoader";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <DirectFaviconLoader />  {/* Direct fetch call */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 4. Server-Side API Call

```tsx
// In layout.tsx
import ServerFaviconLoader from "@/components/favicon/ServerFaviconLoader";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <ServerFaviconLoader />  {/* Server-side API call */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 5. Inline API Call (Most Direct)

```tsx
// In layout.tsx
"use client";
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await fetch('/api/content/logos/active/favicon');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Update favicon in DOM
          const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
          existingFavicons.forEach(link => link.remove());
          
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = data.data.url;
          link.type = 'image/x-icon';
          document.head.appendChild(link);
        }
      } catch (error) {
        console.error('Favicon loading error:', error);
      }
    };
    
    loadFavicon();
  }, []);

  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 6. Using the Hook in Root Component

```tsx
// In layout.tsx
"use client";
import { useFavicon } from "@/hooks/use-favicon";

export default function RootLayout({ children }) {
  const { favicon, loading, error } = useFavicon();
  
  // The hook automatically updates the DOM
  // You can also use the favicon data here if needed
  
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## API Endpoints

The favicon system uses these API endpoints:

- **`/api/content/logos/active/favicon`** - Get active favicon
- **`/api/content/logos`** - Get all logos (with type filter)
- **`/api/content/logos/upload`** - Upload new favicon

## Current Implementation

Your current setup uses **Method 1** (FaviconProvider with useFavicon hook), which is the recommended approach because:

✅ **Reusable**: Can be used in any component  
✅ **Error Handling**: Built-in error handling  
✅ **Loading States**: Manages loading states  
✅ **Type Safety**: Full TypeScript support  
✅ **Automatic Updates**: Updates DOM automatically  

## How to Test

1. **Check Console**: Look for favicon loading messages
2. **Check Network Tab**: See the API call to `/api/content/logos/active/favicon`
3. **Check DOM**: Look for `<link rel="icon">` tags in document head
4. **Check Browser Tab**: See the favicon in your browser tab

## Debugging

Add this to see what's happening:

```tsx
// In any component
import { useFavicon } from "@/hooks/use-favicon";

function DebugFavicon() {
  const { favicon, loading, error } = useFavicon();
  
  console.log('Favicon Debug:', { favicon, loading, error });
  
  return (
    <div>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>Error: {error || 'None'}</p>
      <p>Favicon URL: {favicon?.url || 'None'}</p>
    </div>
  );
}
```
