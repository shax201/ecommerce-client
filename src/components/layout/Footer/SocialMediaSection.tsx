"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";
import { ContactInfo } from "./footer.types";

interface SocialMediaSectionProps {
  contactInfo: ContactInfo;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ contactInfo }) => {
  const socialMedia = contactInfo.socialMedia || {};
  
  // Create social media links array with icons
  const socialLinks = [
    {
      id: 'twitter',
      icon: <FaTwitter />,
      url: socialMedia.twitter,
      name: 'Twitter'
    },
    {
      id: 'facebook',
      icon: <FaFacebookF />,
      url: socialMedia.facebook,
      name: 'Facebook'
    },
    {
      id: 'instagram',
      icon: <FaInstagram />,
      url: socialMedia.instagram,
      name: 'Instagram'
    },
    {
      id: 'github',
      icon: <FaGithub />,
      url: socialMedia.github,
      name: 'GitHub'
    }
  ].filter(social => social.url); // Only show social media with URLs

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      {socialLinks.map((social) => (
        <Link
          href={social.url!}
          key={social.id}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-black hover:text-white transition-all mr-3 w-7 h-7 rounded-full border border-black/20 flex items-center justify-center p-1.5"
          aria-label={`Visit our ${social.name} page`}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
};

export default SocialMediaSection;
