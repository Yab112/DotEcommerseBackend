// dto/product.dto.ts
import { Document } from 'mongoose';

export interface VariantBase {
  _id?: string;
  sku?: string;
  price: number;
  stock: number;
  color: string;
  size: string;
  gender: 'male' | 'female' | 'child' | 'unisex';
  images: string[];
  attributes?: {
    key: string;
    value: string;
  }[];
}

export interface Variant extends Omit<VariantBase, 'attributes'> {
  [x: string]: string | number | string[] | undefined;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  type: string;
  sku?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  variants: Variant[];
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
  totalStock: number;
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
