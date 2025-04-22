import { ICart } from '@/dto/cart.dto';
import { Schema, Types, model } from 'mongoose';

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

const Cart = model<ICart>('Cart', cartSchema);
export default Cart;
