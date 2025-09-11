import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col items-start aspect-auto animate-pulse">
      {/* Image placeholder */}
      <div className="bg-gray-300 rounded-[20px] w-full max-w-[295px] aspect-square mb-4 overflow-hidden"></div>

      {/* Title placeholder */}
      <div className="h-5 bg-gray-300 rounded-full w-3/4 mb-2"></div>

      {/* Rating placeholder */}
      <div className="flex items-end mb-2">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded-full"></div>
          ))}
        </div>
        <div className="h-3 bg-gray-300 rounded-full w-8 ml-3"></div>
      </div>

      {/* Price placeholder */}
      <div className="flex items-center space-x-2.5">
        <div className="h-6 bg-gray-300 rounded-full w-12"></div>
        <div className="h-6 bg-gray-300 rounded-full w-12"></div>
        <div className="h-6 bg-gray-300 rounded-full w-12"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
