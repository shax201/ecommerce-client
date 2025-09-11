"use client";

import { useFavicon } from "@/hooks/use-favicon";

export default function FaviconProvider() {
  // This component doesn't render anything visible
  // It just manages the favicon in the background using the existing logo system
  useFavicon();

  return null;
}
