# Content Management API Integration

This directory contains the API integration for the content management system. The content management system allows you to manage logos, hero sections, client logos, and footer content through a comprehensive REST API.

## Files Overview

### `content.ts`
The main API actions file that provides server-side functions for all content management operations.

### Service Files
- `logo-service.ts` - Legacy interface for logo management
- `hero-section-service.ts` - Legacy interface for hero section management  
- `client-logo-service.ts` - Legacy interface for client logo management
- `footer-service.ts` - Legacy interface for footer management
- `content-service.ts` - Modern unified service interface

## API Endpoints

All content management endpoints are prefixed with `/api/v1/content`

### Logo Management
- `POST /api/v1/content/logos` - Create logo
- `GET /api/v1/content/logos` - Get all logos (with filters)
- `GET /api/v1/content/logos/active/{type}` - Get active logos by type
- `GET /api/v1/content/logos/{id}` - Get logo by ID
- `PUT /api/v1/content/logos/{id}` - Update logo
- `DELETE /api/v1/content/logos/{id}` - Delete logo

### Hero Section Management
- `POST /api/v1/content/hero-sections` - Create hero section
- `GET /api/v1/content/hero-sections` - Get all hero sections (with filters)
- `GET /api/v1/content/hero-sections/active` - Get active hero sections
- `GET /api/v1/content/hero-sections/{id}` - Get hero section by ID
- `PUT /api/v1/content/hero-sections/{id}` - Update hero section
- `DELETE /api/v1/content/hero-sections/{id}` - Delete hero section
- `PUT /api/v1/content/hero-sections/reorder` - Reorder hero sections

### Client Logo Management
- `POST /api/v1/content/client-logos` - Create client logo
- `GET /api/v1/content/client-logos` - Get all client logos (with filters)
- `GET /api/v1/content/client-logos/active` - Get active client logos
- `GET /api/v1/content/client-logos/{id}` - Get client logo by ID
- `PUT /api/v1/content/client-logos/{id}` - Update client logo
- `DELETE /api/v1/content/client-logos/{id}` - Delete client logo
- `PUT /api/v1/content/client-logos/reorder` - Reorder client logos

### Footer Management
- `GET /api/v1/content/footer` - Get footer data
- `PUT /api/v1/content/footer` - Update footer
- `PUT /api/v1/content/footer/contact-info` - Update contact information
- `POST /api/v1/content/footer/sections` - Add footer section
- `PUT /api/v1/content/footer/sections/{sectionId}` - Update footer section
- `DELETE /api/v1/content/footer/sections/{sectionId}` - Delete footer section
- `POST /api/v1/content/footer/sections/{sectionId}/links` - Add footer link
- `PUT /api/v1/content/footer/sections/{sectionId}/links/{linkId}` - Update footer link
- `DELETE /api/v1/content/footer/sections/{sectionId}/links/{linkId}` - Delete footer link

## Usage Examples

### Using the Modern Service (Recommended)

```typescript
import { LogoService, HeroSectionService, ClientLogoService, FooterService } from '@/lib/services/content-service';

// Logo Management
const logos = await LogoService.getAll({ type: 'main', isActive: true });
const newLogo = await LogoService.create({
  name: 'Main Logo',
  url: 'https://example.com/logo.png',
  altText: 'Company Logo',
  type: 'main'
});

// Hero Section Management
const heroSections = await HeroSectionService.getActive();
const newHero = await HeroSectionService.create({
  title: 'Welcome to Our Store',
  subtitle: 'Discover Amazing Products',
  description: 'Find the best deals on fashion and more.',
  primaryButtonText: 'Shop Now',
  primaryButtonLink: '/shop'
});

// Client Logo Management
const clientLogos = await ClientLogoService.getActive();
const newClientLogo = await ClientLogoService.create({
  name: 'Brand Partner',
  logoUrl: 'https://example.com/partner-logo.png',
  altText: 'Partner Logo',
  websiteUrl: 'https://partner.com'
});

// Footer Management
const footer = await FooterService.get();
await FooterService.updateContactInfo({
  email: 'support@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street, City, State 12345'
});
```

### Using the Legacy Services (For Existing Components)

```typescript
import { logoService } from '@/lib/services/logo-service';
import { heroSectionService } from '@/lib/services/hero-section-service';
import { clientLogoService } from '@/lib/services/client-logo-service';
import { footerService } from '@/lib/services/footer-service';

// Logo Management
const logos = await logoService.getLogos();
const newLogo = await logoService.createLogo({
  name: 'Main Logo',
  url: 'https://example.com/logo.png',
  altText: 'Company Logo',
  type: 'main'
});

// Hero Section Management
const heroSections = await heroSectionService.getHeroSections();
const newHero = await heroSectionService.createHeroSection({
  title: 'Welcome to Our Store',
  subtitle: 'Discover Amazing Products',
  description: 'Find the best deals on fashion and more.'
});

// Client Logo Management
const clientLogos = await clientLogoService.getClientLogos();
const newClientLogo = await clientLogoService.createClientLogo({
  name: 'Brand Partner',
  logoUrl: 'https://example.com/partner-logo.png',
  altText: 'Partner Logo'
});

// Footer Management
const footer = await footerService.getFooter();
await footerService.updateContactInfo({
  email: 'support@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street, City, State 12345'
});
```

### Using Server Actions Directly

```typescript
import { 
  createLogo, 
  getLogos, 
  createHeroSection, 
  getHeroSections,
  getFooter,
  updateFooter 
} from '@/actions/content';

// Server-side usage
const logosResponse = await getLogos({ type: 'main', isActive: true });
if (logosResponse.success) {
  console.log('Logos:', logosResponse.data);
}

const heroResponse = await createHeroSection({
  title: 'Welcome to Our Store',
  subtitle: 'Discover Amazing Products',
  description: 'Find the best deals on fashion and more.'
});

const footerResponse = await getFooter();
if (footerResponse.success) {
  console.log('Footer data:', footerResponse.data);
}
```

## Data Types

### Logo
```typescript
interface LogoFormData {
  name: string;
  description?: string;
  url: string;
  altText: string;
  type: 'main' | 'footer' | 'favicon';
  isActive?: boolean;
}
```

### Hero Section
```typescript
interface HeroSectionFormData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  isActive?: boolean;
  order?: number;
}
```

### Client Logo
```typescript
interface ClientLogoFormData {
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive?: boolean;
  order?: number;
}
```

### Footer
```typescript
interface FooterFormData {
  copyright?: string;
  description?: string;
  logoUrl?: string;
  logoAlt?: string;
}

interface ContactInfoFormData {
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}
```

## Response Format

All API responses follow this consistent format:

```typescript
interface ContentResponse {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}
```

## Error Handling

The services include comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Network Errors**: Automatic retry and fallback mechanisms
- **Server Errors**: Proper error logging and user-friendly messages
- **Type Safety**: Full TypeScript support with proper type checking

## Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
# or
BACKEND_URL=http://localhost:5000
```

## Features

- ✅ **Full CRUD Operations** for all content types
- ✅ **Pagination Support** for large datasets
- ✅ **Filtering and Sorting** capabilities
- ✅ **Order Management** for sections and logos
- ✅ **Active/Inactive Status** management
- ✅ **File Upload Support** (simulated)
- ✅ **Real-time Updates** with optimistic UI
- ✅ **Error Handling** with user-friendly messages
- ✅ **TypeScript Support** with full type safety
- ✅ **Loading States** and user feedback
- ✅ **Refresh Functionality** for data synchronization

## Integration with Components

The content management system is fully integrated with the admin panel components:

- **Logo Management**: `@/app/(admin)/content/components/logo-management.tsx`
- **Hero Section Management**: `@/app/(admin)/content/components/hero-section-management.tsx`
- **Client Logo Management**: `@/app/(admin)/content/components/client-logos-management.tsx`
- **Footer Management**: `@/app/(admin)/content/components/footer-management.tsx`

All components now use the API services for real data management instead of mock data, providing a complete content management solution for your ecommerce platform.
