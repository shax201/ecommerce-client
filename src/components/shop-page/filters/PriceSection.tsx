import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { setPriceRange } from "@/lib/features/products/productsSlice";

interface PriceSectionProps {
  onPriceChange?: (priceRange: { min: number; max: number }) => void;
}

const PriceSection = ({ onPriceChange }: PriceSectionProps) => {
  const dispatch = useDispatch();
  const { minPrice, maxPrice } = useSelector(
    (state: RootState) => state.products
  );

  const handlePriceChange = (values: number[]) => {
    const priceRange = { min: values[0], max: values[1] };
    dispatch(setPriceRange(priceRange));
    
    // Call the parent's price change handler if provided
    if (onPriceChange) {
      onPriceChange(priceRange);
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            value={[minPrice, maxPrice]}
            min={0}
            max={10000}
            step={1}
            label="$"
            onValueChange={handlePriceChange}
          />
          <div className="flex justify-between text-sm mt-2">
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
