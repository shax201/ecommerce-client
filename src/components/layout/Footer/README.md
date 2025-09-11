# Dynamic Footer Component

This directory contains a fully dynamic Footer component that integrates with the backend content management system.

## Features

### 🎯 **Dynamic Content**
- **Logo**: Displays custom logo from backend or falls back to text
- **Description**: Customizable footer description
- **Copyright**: Dynamic copyright text
- **Social Media**: Links to social platforms (Twitter, Facebook, Instagram, GitHub)
- **Footer Sections**: Dynamic link sections with customizable titles and links
- **Contact Info**: Email, phone, and address information

### 🔄 **Data Management**
- **Real-time Updates**: Automatically reflects changes made in admin panel
- **Loading States**: Skeleton loading animation while data loads
- **Error Handling**: Graceful fallback to static content on errors
- **Error Boundary**: Catches and handles React errors

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Adaptive Layout**: Links section adjusts for mobile/desktop
- **Touch-Friendly**: Proper touch targets for mobile devices

## File Structure

```
Footer/
├── index.tsx                 # Main Footer component with error boundary
├── footer.types.ts          # TypeScript type definitions
├── useFooterData.ts         # Custom hook for data fetching
├── LinksSection.tsx         # Dynamic links section component
├── SocialMediaSection.tsx   # Social media links component
├── NewsLetterSection.tsx    # Newsletter subscription section
├── FooterSkeleton.tsx       # Loading skeleton component
├── FooterErrorBoundary.tsx  # Error boundary component
├── LayoutSpacing.tsx        # Layout spacing utility
└── README.md               # This documentation
```

## Components

### `Footer` (Main Component)
- Wraps content in error boundary
- Handles loading, error, and success states
- Renders dynamic content from backend

### `FooterContent`
- Main footer rendering logic
- Fetches data using `useFooterData` hook
- Renders appropriate state (loading, error, or content)

### `LinksSection`
- Displays footer link sections
- Filters active sections and links
- Sorts by order
- Handles external/internal links

### `SocialMediaSection`
- Renders social media links
- Only shows platforms with URLs
- Includes proper accessibility attributes

### `FooterSkeleton`
- Loading state animation
- Matches actual footer layout
- Smooth skeleton animations

### `FooterErrorBoundary`
- Catches React errors
- Provides fallback UI
- Logs errors for debugging

## Data Flow

1. **Component Mount**: `useFooterData` hook fetches data
2. **Loading State**: Shows `FooterSkeleton`
3. **Success State**: Renders dynamic content
4. **Error State**: Falls back to static content
5. **Error Boundary**: Catches any rendering errors

## Backend Integration

### API Endpoints
- `GET /api/content/footer` - Fetch footer data
- `PUT /api/content/footer` - Update general footer info
- `PUT /api/content/footer/contact` - Update contact information
- `POST /api/content/footer/sections` - Add footer section
- `PUT /api/content/footer/sections/:id` - Update footer section
- `DELETE /api/content/footer/sections/:id` - Delete footer section
- `POST /api/content/footer/sections/:id/links` - Add footer link
- `PUT /api/content/footer/sections/:sectionId/links/:linkId` - Update footer link
- `DELETE /api/content/footer/sections/:sectionId/links/:linkId` - Delete footer link

### Data Structure
```typescript
interface FooterData {
  id?: string;
  sections: FooterSection[];
  contactInfo: ContactInfo;
  copyright: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Usage

```tsx
import Footer from '@/components/layout/Footer';

// Use in your layout or page
<Footer />
```

## Customization

### Adding New Social Media Platforms
1. Add icon import to `SocialMediaSection.tsx`
2. Add platform to `socialLinks` array
3. Update backend `ContactInfo` type if needed

### Modifying Link Styling
- Update classes in `LinksSection.tsx`
- Modify hover effects and transitions
- Adjust responsive breakpoints

### Changing Loading Animation
- Modify `FooterSkeleton.tsx`
- Update skeleton shapes and timing
- Add new animation effects

## Error Handling

### Network Errors
- Automatic retry on component mount
- Fallback to static content
- Console error logging

### Data Validation
- Type checking with TypeScript
- Safe property access with optional chaining
- Default values for missing data

### React Errors
- Error boundary catches rendering errors
- Graceful degradation
- User-friendly error messages

## Performance

### Optimization Features
- **Lazy Loading**: Only fetches data when component mounts
- **Memoization**: Prevents unnecessary re-renders
- **Image Optimization**: Next.js Image component for logos
- **Skeleton Loading**: Prevents layout shift

### Caching
- Data cached in component state
- Refetch on component remount
- No persistent caching (can be added if needed)

## Accessibility

### ARIA Labels
- Proper `aria-label` attributes on social links
- Screen reader friendly structure
- Keyboard navigation support

### Semantic HTML
- Proper `<footer>` element
- Semantic link structure
- Heading hierarchy

## Testing

### Test Cases
- Loading state rendering
- Error state handling
- Dynamic content display
- Responsive behavior
- Accessibility compliance

### Mock Data
- Use `useFooterData` hook with mock data
- Test error scenarios
- Validate fallback behavior

## Future Enhancements

### Planned Features
- [ ] Real-time updates via WebSocket
- [ ] Client-side caching with SWR/React Query
- [ ] A/B testing for footer layouts
- [ ] Analytics tracking for footer interactions
- [ ] Multi-language support
- [ ] Theme customization

### Performance Improvements
- [ ] Image lazy loading
- [ ] Code splitting
- [ ] Service worker caching
- [ ] Prefetching strategies

## Troubleshooting

### Common Issues

#### Footer Not Loading
- Check network connectivity
- Verify backend API is running
- Check browser console for errors
- Ensure proper API endpoint configuration

#### Styling Issues
- Verify Tailwind CSS classes
- Check responsive breakpoints
- Validate component structure
- Test on different screen sizes

#### Data Not Updating
- Check admin panel changes
- Verify API responses
- Clear browser cache
- Check component re-mounting

### Debug Mode
Enable debug logging by setting:
```typescript
// In useFooterData.ts
console.log('Footer data:', footerData);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write descriptive component names

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback

## License

This component is part of the ecommerce project and follows the same license terms.
