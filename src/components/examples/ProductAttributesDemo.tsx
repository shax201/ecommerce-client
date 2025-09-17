"use client";

import React, { useState } from "react";
import { useGetColorsQuery, useGetSizesQuery } from "@/lib/features/attributes/colorsApi";
import { useGetSizesQuery as useGetSizesQueryHook } from "@/lib/features/attributes/sizesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";

/**
 * ProductAttributesDemo component showing how colors and sizes work in a product context
 */
export default function ProductAttributesDemo() {
  const [selectedColor, setSelectedColor] = useState<{ _id: string; color: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ _id: string; size: string } | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch colors and sizes
  const { data: colorsData, isLoading: isLoadingColors } = useGetColorsQuery();
  const { data: sizesData, isLoading: isLoadingSizes } = useGetSizesQueryHook();

  const colors = colorsData?.data || [];
  const sizes = sizesData?.data || [];

  // Mock product data
  const product = {
    id: "demo-product-1",
    title: "Premium Cotton T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    description: "High-quality cotton t-shirt with modern fit and comfortable feel.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
    ],
    rating: 4.5,
    reviews: 128,
    inStock: true,
  };

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

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select both color and size");
      return;
    }
    
    alert(`Added to cart: ${product.title} - ${selectedColor.color} - ${selectedSize.size} (Qty: ${quantity})`);
  };

  const handleAddToWishlist = () => {
    alert("Added to wishlist!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Attributes Demo</h1>
        <p className="text-gray-600">
          See how colors and sizes work in a real product context
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <div key={index} className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${product.price}</span>
              <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
              <Badge variant="destructive">25% OFF</Badge>
            </div>
          </div>

          <div>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="font-semibold mb-3">Color: {selectedColor?.color || 'Select a color'}</h3>
            {isLoadingColors ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading colors...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const colorClass = getColorClass(color.color);
                  const isSelected = selectedColor?._id === color._id;
                  
                  return (
                    <button
                      key={color._id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } ${colorClass}`}
                      title={color.color}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="font-semibold mb-3">Size: {selectedSize?.size || 'Select a size'}</h3>
            {isLoadingSizes ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading sizes...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize?._id === size._id;
                  
                  return (
                    <button
                      key={size._id}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full border transition-all hover:bg-gray-100 ${
                        isSelected 
                          ? 'bg-black text-white border-black' 
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {size.size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              className="px-4"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Attributes Summary */}
      {(selectedColor || selectedSize) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Selected Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {selectedColor && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Color:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getColorClass(selectedColor.color)}`}></div>
                    <span className="font-medium">{selectedColor.color}</span>
                  </div>
                </div>
              )}
              {selectedSize && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="font-medium">{selectedSize.size}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
