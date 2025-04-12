import { Document} from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface IProduct extends Document {
    name: string;
    description: string;
    sku: string; // Stock Keeping Unit
    price: number;
    compareAtPrice?: number; // For showing discounts
    stock: number;
    category: string;
    subCategory?: string;
    brand?: string;
    images: string[];
    variants: {
      name: string; // e.g., "Size" or "Color"
      options: string[]; // e.g., ["S", "M", "L"] or ["Red", "Blue"]
    }[];
    specifications: {
      key: string;
      value: string;
    }[];
    reviews: {
      user: string;
      rating: number;
      comment?: string;
      createdAt: Date;
    }[];
    averageRating: number;
    status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
    tags: string[];
    weight?: number; // For shipping calculations
    dimensions?: {
      length: number;
      width: number;
      height: number;
    }; // For shipping
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  