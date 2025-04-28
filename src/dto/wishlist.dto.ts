// src/dto/wishlist.dto.ts
import { Document, Types } from 'mongoose';

export interface IWishlistData {
  user: Types.ObjectId | string;
  products: {
    _id?: Types.ObjectId;
    product: Types.ObjectId | string;
    variant: {
      name: string;
      value: string;
    };
    price: number;
    images: string[];
  }[];
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlist extends Document<Types.ObjectId> {
  user: Types.ObjectId | string;
  products: {
    _id?: Types.ObjectId;
    product: Types.ObjectId | string;
    variant: {
      name: string;
      value: string;
    };
    price: number;
    images: string[];
  }[];
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface RemoveProductDTO {
  productId: string;
  variant: {
    name: string;
    value: string;
  };
}

export interface RemoveProductResponse {
  products: IWishlistData['products'];
  price?: number;
  images?: string[];
}
