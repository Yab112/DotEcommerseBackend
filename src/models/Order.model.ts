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
    //google map address
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false },
    },
  },
  { timestamps: true }
);

const Order = model<IOrder>('Order', orderSchema);
export default Order;