export interface IPaymentIntent {
  userId: string;
  orderId?: string;
  gateway: 'stripe' | 'paypal';
  status: 'pending' | 'succeeded' | 'failed';
  amount: number;
  gatewayResponse?: Record<string, any>;
}
