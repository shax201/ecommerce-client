import React from "react";

export type SocialNetworks = {
  id: number;
  icon: React.ReactNode;
  url: string;
};

export type FLink = {
  id: number;
  label: string;
  url: string;
};

export type FooterLinks = {
  id: number;
  title: string;
  children: FLink[];
};

export type PaymentBadge = {
  id: number;
  srcUrl: string;
};

// Backend data types
export type FooterLink = {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  isActive: boolean;
  order: number;
};

export type FooterSection = {
  id: string;
  title: string;
  links: FooterLink[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
};

export type FooterData = {
  id?: string;
  sections: FooterSection[];
  contactInfo: ContactInfo;
  copyright: string;
  description: string;
  logoUrl: string;
  logoAlt: string;
  createdAt?: string;
  updatedAt?: string;
};