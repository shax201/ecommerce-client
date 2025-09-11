import { getActiveLogosByType } from '@/actions/content';

/**
 * Server-side favicon loader
 * This runs on the server and sets the favicon in metadata
 */
export default async function ServerFaviconLoader() {
  try {
    console.log('🔄 Server-side favicon loading...');
    
    // Call the API on the server side
    const response = await getActiveLogosByType('favicon');
    
    if (response.success && response.data) {
      console.log('✅ Server-side favicon loaded:', response.data);
      
      // Return a script that updates the favicon on the client
      return (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🎯 Setting favicon from server:', '${response.data.url}');
                
                // Remove existing favicon links
                const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
                existingFavicons.forEach(link => link.remove());
                
                // Create new favicon link
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = '${response.data.url}';
                link.type = 'image/x-icon';
                link.setAttribute('alt', '${response.data.altText || 'Favicon'}');
                document.head.appendChild(link);
                
                // Update apple-touch-icon for iOS
                const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
                if (appleTouchIcon) {
                  appleTouchIcon.setAttribute('href', '${response.data.url}');
                } else {
                  const appleLink = document.createElement('link');
                  appleLink.rel = 'apple-touch-icon';
                  appleLink.href = '${response.data.url}';
                  document.head.appendChild(appleLink);
                }
              })();
            `,
          }}
        />
      );
    }
  } catch (error) {
    console.error('❌ Server-side favicon error:', error);
  }

  return null;
}
