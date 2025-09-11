"use client";

import React from "react";
import { FooterSection } from "./footer.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LinksSectionProps {
  sections: FooterSection[];
}

const LinksSection: React.FC<LinksSectionProps> = ({ sections }) => {
  // Filter only active sections and sort by order
  const activeSections = sections
    .filter(section => section.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeSections.length === 0) {
    return null;
  }

  return (
    <>
      {activeSections.map((section) => (
        <section className="flex flex-col mt-5" key={section.id}>
          <h3 className="font-medium text-sm md:text-base uppercase tracking-widest mb-6">
            {section.title}
          </h3>
          {section.links
            .filter(link => link.isActive)
            .sort((a, b) => a.order - b.order)
            .map((link) => (
              <Link
                href={link.url}
                key={link.id}
                target={link.isExternal ? "_blank" : "_self"}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                className={cn([
                  "text-black/60 text-sm md:text-base mb-4 w-fit hover:text-black transition-colors duration-200",
                  // Only capitalize if it's not a proper noun or specific formatting
                  !link.title.match(/^(Free eBooks|How to - Blog|youtube playlist)$/i) && "capitalize"
                ])}
              >
                {link.title}
              </Link>
            ))}
        </section>
      ))}
    </>
  );
};

export default LinksSection;
