# Dynamic Favicon Management

This system allows you to dynamically change your website's favicon using the existing logo management system.

## Features

- ✅ **Integrated with Logo Management**: Uses existing logo system with `type: 'favicon'`
- ✅ **Admin Interface**: User-friendly favicon management in admin panel
- ✅ **Real-time Updates**: Favicon changes immediately in the browser
- ✅ **Multiple Formats**: Supports ICO, PNG, and SVG formats
- ✅ **Automatic DOM Updates**: Updates favicon links in document head
- ✅ **Fallback Support**: Graceful handling when no favicon is set

## How It Works

### 1. Logo Management Integration

The favicon system uses the existing logo management system:
- **Type**: `'favicon'` in the logo management
- **API**: Uses existing `getActiveLogosByType('favicon')` endpoint
- **Storage**: Stored in the same database as other logos

### 2. React Hook

- **`useFavicon()`** - Custom hook that fetches favicon data and updates DOM
- **Auto-updates**: Automatically updates favicon in document head when data changes

### 3. Components

- **`FaviconProvider`** - Background component that loads favicon on app start
- **`FaviconManager`** - Admin interface for favicon management
- **`FaviconExample`** - Demo component showing current favicon status

## Usage

### 1. Admin Interface

Navigate to **Admin Panel → Content → Favicon** tab to:
- Upload favicon files
- Enter favicon URLs
- Preview current favicon
- Update favicon settings

### 2. Programmatic Usage

```tsx
import { useFavicon } from '@/hooks/use-favicon';

function MyComponent() {
  const { favicon, loading, error } = useFavicon();

  if (loading) return <div>Loading favicon...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Current Favicon</h3>
      {favicon && (
        <img 
          src={favicon.url} 
          alt={favicon.altText}
          className="w-8 h-8"
        />
      )}
    </div>
  );
}
```

### 3. Direct Logo Management

You can also manage favicons through the existing logo management system:

```tsx
import { logoService } from '@/lib/services/logo-service';

// Create a new favicon
await logoService.createLogo({
  name: "Website Favicon",
  description: "Browser tab icon",
  url: "https://example.com/favicon.ico",
  altText: "Website Favicon",
  type: "favicon",
  isActive: true,
});

// Update existing favicon
await logoService.updateLogo(faviconId, {
  url: "https://example.com/new-favicon.ico",
  altText: "New Favicon"
});
```

## File Structure

```
src/
├── hooks/
│   └── use-favicon.tsx          # Favicon management hook
├── components/
│   └── favicon/
│       ├── FaviconProvider.tsx  # Background favicon loader
│       ├── FaviconManager.tsx   # Admin interface
│       ├── FaviconExample.tsx   # Demo component
│       └── README.md           # This file
└── app/
    └── layout.tsx               # Updated with FaviconProvider
```

## Supported Formats

- **ICO** (recommended for best compatibility)
- **PNG** (modern browsers)
- **SVG** (vector format, scalable)

## Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## How to Set Up Favicon

### Method 1: Admin Interface (Recommended)

1. Go to **Admin Panel** → **Content** → **Favicon** tab
2. Upload a file or enter a URL
3. Add alt text (optional)
4. Click "Update Favicon"
5. Refresh the page to see changes

### Method 2: Logo Management

1. Go to **Admin Panel** → **Content** → **Logo** tab
2. Click "Add Logo" or edit existing logo
3. Set **Type** to "Favicon"
4. Upload your favicon file or enter URL
5. Save the logo

## Technical Details

### DOM Updates

The system automatically updates these elements in the document head:
- `<link rel="icon" href="...">` - Standard favicon
- `<link rel="apple-touch-icon" href="...">` - iOS devices

### Caching

- Favicon changes are applied immediately
- Browser may cache favicons, so refresh may be needed
- Consider using cache-busting URLs for immediate updates

## Troubleshooting

### Favicon Not Updating
- **Refresh the page** - Browser may have cached the old favicon
- **Clear browser cache** - Hard refresh (Ctrl+F5)
- **Check console** - Look for any JavaScript errors
- **Verify URL** - Ensure favicon URL is accessible

### Admin Interface Issues
- **Check network tab** - Look for failed API requests
- **Verify permissions** - Ensure you have admin access
- **Check logo service** - Verify the logo management system is working

### Format Issues
- **Use ICO format** - Best compatibility across browsers
- **Check file size** - Keep under 10KB for best performance
- **Verify URL accessibility** - Ensure the favicon URL is publicly accessible

## Best Practices

1. **Use ICO format** for maximum compatibility
2. **Keep file size small** (< 10KB recommended)
3. **Use 32x32 or 16x16 pixel dimensions**
4. **Test across different browsers**
5. **Provide meaningful alt text** for accessibility
6. **Use HTTPS URLs** for production

## Future Enhancements

- [ ] Multiple favicon sizes (16x16, 32x32, etc.)
- [ ] Apple touch icons
- [ ] Android home screen icons
- [ ] Theme-based favicons (light/dark mode)
- [ ] Animated favicons
- [ ] Real-time updates without page refresh
