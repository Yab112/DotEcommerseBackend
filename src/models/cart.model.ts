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
        variantName: {
          type: String,
          required: true,
        }, // example: "Color", "Size", "Gender"
        variantValue: {
          type: String,
          required: true,
        }, // example: "Red", "Small", "Male"
        price: {
          type: Number,
          required: true,
        }, // store price at time of adding to cart
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        images: {
          type: [String],
          default: [],
        }, // optional: show selected variant images
      },
    ],
  },
  { timestamps: true },
);

const Cart = model<ICart>('Cart', cartSchema);
export default Cart;
