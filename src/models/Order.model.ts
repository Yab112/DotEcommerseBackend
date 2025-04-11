// order.model.ts
import { IOrder } from '@/dto/order.dto';
import { Document, Schema, model } from 'mongoose';



const orderSchema = new Schema<IOrder>(
  {
    user: { type: String, ref: 'User', required: true },
    items: [{
      productId: { type: String, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Order = model<IOrder>('Order', orderSchema);
export default Order;