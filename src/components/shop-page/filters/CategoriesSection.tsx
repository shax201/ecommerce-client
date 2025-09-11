"use client";

import { useGetCategoriesQuery } from "@/lib/features/products/productApi";
import { setCategories } from "@/lib/features/products/productsSlice";
import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useDispatch } from "react-redux";

type Category = {
  title: string;
  slug: string;
};

const categoriesData: Category[] = [
  {
    title: "T-shirts",
    slug: "/shop?category=t-shirts",
  },
  {
    title: "Shorts",
    slug: "/shop?category=shorts",
  },
  {
    title: "Shirts",
    slug: "/shop?category=shirts",
  },
  {
    title: "Hoodie",
    slug: "/shop?category=hoodie",
  },
  {
    title: "Jeans",
    slug: "/shop?category=jeans",
  },
];

const CategoriesSection = () => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useGetCategoriesQuery();
  const handleCategory = (catId: string) => {
    dispatch(setCategories(catId));
  };
  return (
    <div className="flex flex-col text-black/60">
      {isLoading && (
        <>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-5 bg-gray-300 rounded-full w-3/4 my-2"
            ></div>
          ))}
        </>
      )}
      {data?.data.map((category: any, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-2 cursor-pointer"
          onClick={() => handleCategory(category._id)}
        >
          {category.title} {category.parent && <MdKeyboardArrowRight />}
        </div>
      ))}
    </div>
  );
};

export default CategoriesSection;
