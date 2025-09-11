export type Discount = {
  amount: number;
  percentage: number;
};

type Color = {
  name: string;
  code: string;
};

export type Variants = {
  color: Color[];
  size: string[];
};

export type Product = {
  discountPrice: number;
  regularPrice: number;
  catagory: any;
  description: string;
  id: number;
  title: string;
  primaryImage: string;
  optionalImages: string[];
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  variants: Variants;
};
