"use client";

import React, { FC, useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useGetSizesQuery } from "@/lib/features/attributes/sizesApi";
import { Loader2 } from "lucide-react";

interface SizeSectionProps {
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

const SizeSection: FC<SizeSectionProps> = ({ onSizeSelect, selectedSize }) => {
  const [selected, setSelected] = useState<string>("");
  
  // Fetch sizes from API
  const {
    data: sizesData,
    error: sizesError,
    isLoading: isLoadingSizes,
  } = useGetSizesQuery();

  const sizes = sizesData?.data || [];

  // Group sizes by type for better organization
  const groupedSizes = sizes.reduce((acc, size) => {
    const numericSize = parseFloat(size.size);
    let type = 'other';
    
    if (!isNaN(numericSize)) {
      if (numericSize < 10) type = 'clothing';
      else if (numericSize < 50) type = 'shoes';
      else type = 'measurement';
    } else if (size.size.includes('XL') || size.size.includes('S') || size.size.includes('M') || size.size.includes('L')) {
      type = 'clothing';
    } else if (size.size.includes('US') || size.size.includes('UK') || size.size.includes('EU')) {
      type = 'shoes';
    }
    
    if (!acc[type]) acc[type] = [];
    acc[type].push(size);
    return acc;
  }, {} as Record<string, typeof sizes>);

  const handleSizeSelect = (size: string) => {
    setSelected(size);
    onSizeSelect(size);
  };

  // Set initial selection if selectedSize prop is provided
  useEffect(() => {
    if (selectedSize && !selected) {
      setSelected(selectedSize);
    }
  }, [selectedSize, selected]);

  // Handle URL parameter for size
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSize = urlParams.get('size');
    
    if (urlSize && sizes.length > 0) {
      const sizeFromUrl = sizes.find(s => s.size.toLowerCase() === urlSize.toLowerCase());
      if (sizeFromUrl) {
        setSelected(sizeFromUrl.size);
        onSizeSelect(sizeFromUrl.size);
      }
    }
  }, [sizes, onSizeSelect]);

  return (
    <Accordion type="single" collapsible defaultValue="filter-size">
      <AccordionItem value="filter-size" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Size
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          {isLoadingSizes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading sizes...</span>
            </div>
          ) : sizesError ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">Failed to load sizes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSizes).map(([type, typeSizes]) => (
                <div key={type}>
                  {type !== 'other' && (
                    <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                      {type === 'clothing' ? 'Clothing Sizes' : 
                       type === 'shoes' ? 'Shoe Sizes' : 
                       type === 'measurement' ? 'Measurements' : 'Other Sizes'}
                    </h4>
                  )}
                  <div className="flex items-center flex-wrap gap-2">
                    {typeSizes.map((size) => {
                      const isSelected = selected === size.size;
                      
                      return (
                        <button
                          key={size._id}
                          type="button"
                          className={cn([
                            "bg-[#F0F0F0] flex items-center justify-center px-4 py-2 text-sm rounded-full transition-all hover:bg-gray-200",
                            isSelected && "bg-black font-medium text-white hover:bg-gray-800",
                          ])}
                          onClick={() => handleSizeSelect(size.size)}
                          title={size.size}
                        >
                          {size.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {sizes.length === 0 && !isLoadingSizes && !sizesError && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No sizes available</p>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SizeSection;
