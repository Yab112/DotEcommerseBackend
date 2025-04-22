// coupon.model.ts
import { ICoupon } from '@/dto/coupon.dto';
import { Schema, model } from 'mongoose';

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['flat', 'percent'], default: 'percent' },
    discountValue: { type: Number, required: true },
    expiryDate: { type: Date },
    minimumAmount: { type: Number },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Coupon = model<ICoupon>('Coupon', couponSchema);
export default Coupon;
