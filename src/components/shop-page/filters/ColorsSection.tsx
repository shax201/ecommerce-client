"use client";

import React, { FC, useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";
import { useGetColorsQuery } from "@/lib/features/attributes/colorsApi";
import { Loader2 } from "lucide-react";

interface ColorsSectionProps {
  selectedColor: { name: string; code: string };
  onColorSelect: (color: { name: string; code: string }) => void;
}

const ColorsSection: FC<ColorsSectionProps> = ({
  onColorSelect,
  selectedColor,
}) => {
  const [selected, setSelected] = useState<string>("");
  
  // Fetch colors from API
  const {
    data: colorsData,
    error: colorsError,
    isLoading: isLoadingColors,
  } = useGetColorsQuery();

  const colors = colorsData?.data || [];

  // Color mapping for display
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'red': 'bg-red-600',
      'blue': 'bg-blue-600',
      'green': 'bg-green-600',
      'yellow': 'bg-yellow-300',
      'purple': 'bg-purple-600',
      'pink': 'bg-pink-600',
      'orange': 'bg-orange-600',
      'black': 'bg-black',
      'white': 'bg-white',
      'gray': 'bg-gray-500',
      'brown': 'bg-amber-800',
      'navy': 'bg-blue-900',
      'maroon': 'bg-red-900',
      'teal': 'bg-teal-500',
      'lime': 'bg-lime-500',
      'cyan': 'bg-cyan-400',
    };

    return colorMap[colorName.toLowerCase()] || 'bg-gray-300';
  };

  const handleColorSelect = (color: { _id: string; color: string }) => {
    const colorClass = getColorClass(color.color);
    setSelected(colorClass);
    onColorSelect({
      name: color.color,
      code: colorClass,
    });
  };

  // Set initial selection if selectedColor prop is provided
  useEffect(() => {
    if (selectedColor.code && !selected) {
      setSelected(selectedColor.code);
    }
  }, [selectedColor, selected]);

  // Handle URL parameter for color
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlColor = urlParams.get('color');
    
    if (urlColor && colors.length > 0) {
      const colorFromUrl = colors.find(c => c.color.toLowerCase() === urlColor.toLowerCase());
      if (colorFromUrl) {
        const colorClass = getColorClass(colorFromUrl.color);
        setSelected(colorClass);
        onColorSelect({
          name: colorFromUrl.color,
          code: colorClass,
        });
      }
    }
  }, [colors, onColorSelect]);

  return (
    <Accordion type="single" collapsible defaultValue="filter-colors">
      <AccordionItem value="filter-colors" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Colors
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          {isLoadingColors ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading colors...</span>
            </div>
          ) : colorsError ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">Failed to load colors</p>
            </div>
          ) : (
            <div className="flex space-2.5 flex-wrap md:grid grid-cols-5 gap-2.5">
              {colors.map((color) => {
                const colorClass = getColorClass(color.color);
                const isSelected = selected === colorClass;
                
                return (
                  <button
                    key={color._id}
                    type="button"
                    className={cn([
                      colorClass,
                      "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border border-black/20 transition-all hover:scale-110",
                      isSelected && "ring-2 ring-blue-500 ring-offset-2"
                    ])}
                    onClick={() => handleColorSelect(color)}
                    title={color.color}
                  >
                    {isSelected && (
                      <IoMdCheckmark className="text-base text-white drop-shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {colors.length === 0 && !isLoadingColors && !colorsError && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No colors available</p>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ColorsSection;
