// dto/inventory.dto.ts
import { Types } from 'mongoose';

export interface IInventory {
  product: Types.ObjectId;
  variant: { name: string; value: string }[];
  stock: number;
  reservedStock?: number;
  sku?: string;
  lowStockThreshold?: number;
  warehouse?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
