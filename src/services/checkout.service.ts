// services/checkout.service.ts
import Product from '@/models/product.model';
import PaymentIntent from '@/models/paymentIntent.model';
import { cartService } from '@/services/cart.service';
import { Stripe } from 'stripe';
import { Types } from 'mongoose';
import { CheckoutDTO } from '@/types/checkout.type';
import { env } from '@/config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });

class CheckoutService {
  async initiateCheckout(
    userId: string,
    checkoutData: CheckoutDTO,
  ): Promise<{ clientSecret: string; paymentIntentId: Types.ObjectId }> {
    const { shippingAddress, paymentMethod } = checkoutData;
    const cartData = await cartService.getCart(userId);

    if (!cartData.items.length) {
      throw new Error('Cart is empty');
    }

    // Validate product and variant details
    await Promise.all(
      cartData.items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product.toString()} not found`);
        }

        const variant = product.variants.find(
          (v) => v.name === item.variantName && v.value === item.variantValue,
        );
        if (!variant) {
          throw new Error(
            `Variant ${item.variantName}:${item.variantValue} not found for product ${item.product as string}`,
          );
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.product as string} variant ${item.variantName}:${item.variantValue}`,
          );
        }
      }),
    );

    const totalAmount = await this.calculateTotal(cartData.items);

    let paymentIntent: Stripe.PaymentIntent;
    if (paymentMethod === 'stripe') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        metadata: {
          userId,
          cartId: cartData._id.toString(),
        },
      });
    } else {
      throw new Error('PayPal not implemented');
    }

    const paymentIntentDoc = await PaymentIntent.create({
      userId,
      gateway: paymentMethod,
      status: 'pending',
      amount: totalAmount,
      shippingAddress,
      gatewayResponse: paymentIntent,
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent');
    }

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntentDoc._id };
  }

  private async calculateTotal(
    items: {
      product: string | Types.ObjectId;
      variantName: string;
      variantValue: string;
      quantity: number;
    }[],
  ): Promise<number> {
    return items.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product as string} not found`);
      }

      const variant = product.variants.find(
        (v) => v.name === item.variantName && v.value === item.variantValue,
      );
      if (!variant) {
        throw new Error(
          `Variant ${item.variantName}:${item.variantValue} not found for product ${item.product as string}`,
        );
      }

      return acc + variant.price * item.quantity;
    }, Promise.resolve(0));
  }
}

export const checkoutService = new CheckoutService();
