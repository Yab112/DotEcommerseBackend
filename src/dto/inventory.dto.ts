import { Types } from 'mongoose';

export interface IInventory {
  product: Types.ObjectId;
  variant?: string;
  stock: number;
}
