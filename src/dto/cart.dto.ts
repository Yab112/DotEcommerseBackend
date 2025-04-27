// dto/cart.dto.ts
import { Types } from 'mongoose';

export interface AddToCartDTO {
  product: string;
  variant: { name: string; value: string }[];
  quantity: number;
}

export interface UpdateCartItemDTO {
  product: string;
  variant: { name: string; value: string }[];
  quantity: number;
}

export interface ICartItem {
  product: string | Types.ObjectId;
  variant: { name: string; value: string }[];
  quantity: number;
  _id?: Types.ObjectId;
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  _id?: Types.ObjectId;
}
