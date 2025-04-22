// paymentIntent.model.ts
import { IPaymentIntent } from '@/dto/payment.dto';
import { Schema, model } from 'mongoose';

const paymentIntentSchema = new Schema<IPaymentIntent>(
  {
    userId: { type: Schema.Types.String, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    gateway: { type: String, enum: ['stripe', 'paypal'], required: true },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
    amount: { type: Number, required: true },
    gatewayResponse: { type: Object }, // Raw JSON response from Stripe/PayPal
  },
  {
    timestamps: true,
  },
);

const PaymentIntent = model<IPaymentIntent>('PaymentIntent', paymentIntentSchema);
export default PaymentIntent;
