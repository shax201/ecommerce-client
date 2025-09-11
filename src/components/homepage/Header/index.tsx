import React from "react";
import HeroSlider from "./HeroSlider";

interface HeroSectionProps {
  heroSections?: any[];
}

const HeroSection = ({ heroSections }: HeroSectionProps) => {
  return <HeroSlider heroSections={heroSections} />;
};

export default HeroSection;
