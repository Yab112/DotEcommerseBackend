import { Types } from 'mongoose';

export interface AddToCartDTO {
  product: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  product: string;
  quantity: number;
}

export interface ICartItem {
  _id?: Types.ObjectId;
  product: string;
  quantity: number;
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
}
