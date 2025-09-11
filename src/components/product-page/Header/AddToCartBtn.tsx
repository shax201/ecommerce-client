"use client";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { calculateDiscountPercentage } from "@/lib/utils";
import { Product } from "@/types/product.types";
import React from "react";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  return (
    <button
      type="button"
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
      onClick={() => {
        const discount = calculateDiscountPercentage(
          data.regularPrice,
          data.discountPrice
        );

        const productData: any = data;
        const productId = productData._id;
        dispatch(
          addToCart({
            id: productId,
            name: data.title,
            srcUrl: data.primaryImage,
            price: data.regularPrice,
            attributes: [sizeSelection, colorSelection.name],
            discount: {
              amount: data.discountPrice,
              percentage: discount,
            },
            quantity: data.quantity,
          })
        );
      }}
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
