import React from "react";

const ProductDetailsSkeleton = () => {
  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />

        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>

        {/* Main content skeleton */}
        <section className="mb-11">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image section skeleton */}
            <div>
              <div className="bg-gray-300 rounded-lg w-full aspect-square animate-pulse"></div>
            </div>

            {/* Product info section skeleton */}
            <div>
              {/* Title skeleton */}
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-3 animate-pulse"></div>

              {/* Rating skeleton */}
              <div className="flex items-center mb-3 sm:mb-3.5">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-gray-300 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-300 rounded w-8 ml-3 animate-pulse"></div>
              </div>

              {/* Price skeleton */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
                <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-2 mb-5">
                <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              </div>

              <hr className="h-[1px] border-t-black/10 mb-5" />

              {/* Color selection skeleton */}
              <div className="mb-5">
                <div className="h-4 bg-gray-300 rounded w-16 mb-3 animate-pulse"></div>
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              <hr className="h-[1px] border-t-black/10 my-5" />

              {/* Size selection skeleton */}
              <div className="mb-5">
                <div className="h-4 bg-gray-300 rounded w-12 mb-3 animate-pulse"></div>
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-8 bg-gray-300 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />

              {/* Add to cart section skeleton */}
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="h-12 bg-gray-300 rounded w-16 animate-pulse"></div>
                  <div className="h-12 bg-gray-300 rounded flex-1 animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="mb-[50px] sm:mb-20">
        {/* Related products skeleton */}
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-gray-300 rounded-lg w-full aspect-square animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailsSkeleton;
