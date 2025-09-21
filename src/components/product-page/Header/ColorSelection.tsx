"use client";

import {
  Color,
  setColorSelection,
} from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import React, { FC } from "react";
import { IoMdCheckmark } from "react-icons/io";

type IColorSelection = {
  colors: Color[];
};

const ColorSelection: FC<IColorSelection> = ({ colors }) => {
  const { colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  console.log("color", colors);

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Colors
      </span>
      <div className="flex items-center flex-wrap space-x-3 sm:space-x-4">
        {colors?.map((color, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <button
              type="button"
              style={{ background: color.name || color.code }}
              className={cn([
                "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border-2 border-gray-200 hover:border-gray-400 transition-colors",
              ])}
              onClick={() => dispatch(setColorSelection(color))}
              title={color.name || color.code}
            >
              {colorSelection.name === color.name && (
                <IoMdCheckmark className="text-base text-white" />
              )}
            </button>
            <span className="text-xs text-gray-600 text-center max-w-[60px] truncate">
              {color.name || color.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSelection;
