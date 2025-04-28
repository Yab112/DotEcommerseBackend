// src/models/wishlist.model.ts
import { Schema, model } from 'mongoose';
import type { IWishlist } from '@/dto/wishlist.dto';

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variant: {
          type: {
            name: { type: String, required: true },
            value: { type: String, required: true },
          },
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        images: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  { timestamps: true },
);

const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;
