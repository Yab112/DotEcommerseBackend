// dto/product.dto.ts
import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  type: string;
  sku?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  variants: {
    name: string; // e.g., "Size", "Color"
    options: {
      value: string; // e.g., "Small", "Red"
      price: number;
      images: string[];
    }[];
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
  reviews?: {
    user: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];
  averageRating?: number;
  status: 'active' | 'draft' | 'discontinued';
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  subCategory?: string;
  brand?: string;
  isFeatured?: boolean;
  status?: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  sort?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sku?: string;
  [key: string]: unknown;
  price?: {
    $gte?: number;
    $lte?: number;
  };
}
