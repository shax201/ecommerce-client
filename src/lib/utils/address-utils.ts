/**
 * Shared utility functions for handling address data
 */

export interface AddressObject {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Formats an address object or string into a readable string format
 * @param address - Address as string or AddressObject
 * @returns Formatted address string
 */
export function formatAddress(address: string | AddressObject | undefined | null): string {
  if (!address) {
    return 'No address provided';
  }
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address !== null) {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ') || 'No address provided';
  }
  
  return 'No address provided';
}

/**
 * Formats an address for display in tables (with truncation)
 * @param address - Address as string or AddressObject
 * @param maxLength - Maximum length before truncation
 * @returns Formatted address string
 */
export function formatAddressForTable(address: string | AddressObject | undefined | null, maxLength: number = 50): string {
  const formatted = formatAddress(address);
  return formatted.length > maxLength ? `${formatted.substring(0, maxLength)}...` : formatted;
}
