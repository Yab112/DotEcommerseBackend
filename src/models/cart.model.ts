import { Schema, model } from 'mongoose';
import type { ICart } from '@/dto/cart.dto';

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variant: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true },
);

const Cart = model<ICart>('Cart', cartSchema);
export default Cart;
