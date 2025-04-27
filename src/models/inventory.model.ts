// inventory.model.ts
import { Schema, model } from 'mongoose';
import type { IInventory } from '@/dto/inventory.dto';

const inventorySchema = new Schema<IInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variant: {
      type: [{ name: String, value: String }],
      required: true,
      validate: {
        validator: (v: { name: string; value: string }[]) => v.length > 0,
        message: 'Variant must have at least one attribute',
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },
    warehouse: {
      type: String,
      trim: true,
      default: 'default',
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({ product: 1, 'variant.name': 1, 'variant.value': 1 }, { unique: true });

const Inventory = model<IInventory>('Inventory', inventorySchema);
export default Inventory;
