// Footer Redux exports
export * from './footerSlice';
export * from './footerApi';

// Export the reducer for store configuration
export { footerReducer } from './footerSlice';

// Re-export types for convenience
export type {
  FooterData,
  FooterFormData,
  ContactInfoFormData,
  FooterSectionFormData,
  FooterLinkFormData,
  FooterLink,
  FooterSection,
  ContactInfo,
} from './footerSlice';

export type {
  FooterResponse,
  ContentResponse,
} from './footerApi';
