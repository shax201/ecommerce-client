// ISR Cache tags for revalidation

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
  NAVBAR: "navbar",
} as const;
