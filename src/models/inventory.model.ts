import { IInventory } from '@/dto/inventory.dto';
import { Schema, model } from 'mongoose';

const inventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: String }, // e.g., color: red
    stock: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const Inventory = model<IInventory>('Inventory', inventorySchema);
export default Inventory;
