import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ===== TYPES =====

export interface FooterLink {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  url: string;
  isExternal: boolean;
  isActive: boolean;
  order: number;
}

export interface FooterSection {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  links: FooterLink[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

export interface FooterData {
  id?: string;
  _id?: string; // MongoDB ID
  sections: FooterSection[];
  contactInfo: ContactInfo;
  copyright: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FooterFormData {
  copyright?: string;
  description?: string;
  logoUrl?: string;
  logoAlt?: string;
}

export interface ContactInfoFormData {
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

export interface FooterSectionFormData {
  title: string;
  isActive: boolean;
  order: number;
}

export interface FooterLinkFormData {
  title: string;
  url: string;
  isExternal: boolean;
  isActive: boolean;
  order: number;
}

// ===== STATE INTERFACE =====

interface FooterState {
  // Data
  footer: FooterData | null;
  
  // Loading states
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error states
  error: string | null;
  updateError: string | null;
  deleteError: string | null;
  
  // UI states
  lastFetch: number | null;
  isInitialized: boolean;
  
  // Form states
  isGeneralModalOpen: boolean;
  isContactModalOpen: boolean;
  isSectionModalOpen: boolean;
  isLinkModalOpen: boolean;
  isDeleteModalOpen: boolean;
  
  // Editing states
  editingSection: FooterSection | null;
  editingLink: { link: FooterLink; sectionId: string } | null;
  deletingItem: { type: 'section' | 'link'; item: any; sectionId?: string } | null;
}

// ===== INITIAL STATE =====

const initialState: FooterState = {
  // Data
  footer: null,
  
  // Loading states
  loading: false,
  updating: false,
  deleting: false,
  
  // Error states
  error: null,
  updateError: null,
  deleteError: null,
  
  // UI states
  lastFetch: null,
  isInitialized: false,
  
  // Form states
  isGeneralModalOpen: false,
  isContactModalOpen: false,
  isSectionModalOpen: false,
  isLinkModalOpen: false,
  isDeleteModalOpen: false,
  
  // Editing states
  editingSection: null,
  editingLink: null,
  deletingItem: null,
};

// ===== SLICE =====

const footerSlice = createSlice({
  name: 'footer',
  initialState,
  reducers: {
    // ===== DATA MANAGEMENT =====
    
    // Set footer data
    setFooter: (state, action: PayloadAction<FooterData>) => {
      state.footer = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
      state.isInitialized = true;
    },
    
    // Clear footer data
    clearFooter: (state) => {
      state.footer = null;
      state.lastFetch = null;
      state.error = null;
      state.isInitialized = false;
    },
    
    // ===== LOADING STATES =====
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    // Set updating state
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.updating = action.payload;
      if (action.payload) {
        state.updateError = null;
      }
    },
    
    // Set deleting state
    setDeleting: (state, action: PayloadAction<boolean>) => {
      state.deleting = action.payload;
      if (action.payload) {
        state.deleteError = null;
      }
    },
    
    // ===== ERROR STATES =====
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Set update error
    setUpdateError: (state, action: PayloadAction<string | null>) => {
      state.updateError = action.payload;
    },
    
    // Set delete error
    setDeleteError: (state, action: PayloadAction<string | null>) => {
      state.deleteError = action.payload;
    },
    
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.deleteError = null;
    },
    
    // ===== UI STATES =====
    
    // General modal
    setGeneralModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isGeneralModalOpen = action.payload;
    },
    
    // Contact modal
    setContactModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isContactModalOpen = action.payload;
    },
    
    // Section modal
    setSectionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSectionModalOpen = action.payload;
      if (!action.payload) {
        state.editingSection = null;
      }
    },
    
    // Link modal
    setLinkModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLinkModalOpen = action.payload;
      if (!action.payload) {
        state.editingLink = null;
      }
    },
    
    // Delete modal
    setDeleteModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteModalOpen = action.payload;
      if (!action.payload) {
        state.deletingItem = null;
      }
    },
    
    // ===== EDITING STATES =====
    
    // Set editing section
    setEditingSection: (state, action: PayloadAction<FooterSection | null>) => {
      state.editingSection = action.payload;
      state.isSectionModalOpen = action.payload !== null;
    },
    
    // Set editing link
    setEditingLink: (state, action: PayloadAction<{ link: FooterLink; sectionId: string } | null>) => {
      state.editingLink = action.payload;
      state.isLinkModalOpen = action.payload !== null;
    },
    
    // Set deleting item
    setDeletingItem: (state, action: PayloadAction<{ type: 'section' | 'link'; item: any; sectionId?: string } | null>) => {
      state.deletingItem = action.payload;
      state.isDeleteModalOpen = action.payload !== null;
    },
    
    // ===== DATA UPDATES =====
    
    // Update general info
    updateGeneralInfo: (state, action: PayloadAction<Partial<FooterFormData>>) => {
      if (state.footer) {
        state.footer = {
          ...state.footer,
          ...action.payload,
        };
      }
    },
    
    // Update contact info
    updateContactInfo: (state, action: PayloadAction<Partial<ContactInfo>>) => {
      if (state.footer) {
        state.footer.contactInfo = {
          ...state.footer.contactInfo,
          ...action.payload,
        };
      }
    },
    
    // Add section
    addSection: (state, action: PayloadAction<FooterSection>) => {
      if (state.footer) {
        state.footer.sections.push(action.payload);
      }
    },
    
    // Update section
    updateSection: (state, action: PayloadAction<FooterSection>) => {
      if (state.footer) {
        const index = state.footer.sections.findIndex(s => s.id === action.payload.id);
        if (index >= 0) {
          state.footer.sections[index] = action.payload;
        }
      }
    },
    
    // Remove section
    removeSection: (state, action: PayloadAction<string>) => {
      if (state.footer) {
        state.footer.sections = state.footer.sections.filter(s => s.id !== action.payload);
      }
    },
    
    // Add link to section
    addLinkToSection: (state, action: PayloadAction<{ sectionId: string; link: FooterLink }>) => {
      if (state.footer) {
        const section = state.footer.sections.find(s => s.id === action.payload.sectionId);
        if (section) {
          section.links.push(action.payload.link);
        }
      }
    },
    
    // Update link in section
    updateLinkInSection: (state, action: PayloadAction<{ sectionId: string; link: FooterLink }>) => {
      if (state.footer) {
        const section = state.footer.sections.find(s => s.id === action.payload.sectionId);
        if (section) {
          const linkIndex = section.links.findIndex(l => l.id === action.payload.link.id);
          if (linkIndex >= 0) {
            section.links[linkIndex] = action.payload.link;
          }
        }
      }
    },
    
    // Remove link from section
    removeLinkFromSection: (state, action: PayloadAction<{ sectionId: string; linkId: string }>) => {
      if (state.footer) {
        const section = state.footer.sections.find(s => s.id === action.payload.sectionId);
        if (section) {
          section.links = section.links.filter(l => l.id !== action.payload.linkId);
        }
      }
    },
    
    // ===== RESET =====
    
    // Reset state
    resetFooterState: () => initialState,
  },
});

// ===== EXPORTS =====

export const {
  // Data management
  setFooter,
  clearFooter,
  
  // Loading states
  setLoading,
  setUpdating,
  setDeleting,
  
  // Error states
  setError,
  setUpdateError,
  setDeleteError,
  clearErrors,
  
  // UI states
  setGeneralModalOpen,
  setContactModalOpen,
  setSectionModalOpen,
  setLinkModalOpen,
  setDeleteModalOpen,
  
  // Editing states
  setEditingSection,
  setEditingLink,
  setDeletingItem,
  
  // Data updates
  updateGeneralInfo,
  updateContactInfo,
  addSection,
  updateSection,
  removeSection,
  addLinkToSection,
  updateLinkInSection,
  removeLinkFromSection,
  
  // Reset
  resetFooterState,
} = footerSlice.actions;

export const footerReducer = footerSlice.reducer;
export default footerSlice.reducer;
