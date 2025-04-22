import { IWishlist } from '@/dto/wishlist.dto';
import { Schema, model, Types } from 'mongoose';

const wishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;
