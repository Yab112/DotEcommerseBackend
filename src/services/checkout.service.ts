// services/checkout.service.ts
import Inventory from '@/models/inventory.model';
import Product from '@/models/product.model';
import PaymentIntent from '@/models/paymentIntent.model';
import { cartService } from '@/services/cart.service';
import { Stripe } from 'stripe';
import { Types } from 'mongoose';
import { CheckoutDTO } from '@/types/checkout.type';
import { ICart, ICartItem } from '@/dto/cart.dto';
import { env } from '@/config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });

class CheckoutService {
  async initiateCheckout(
    userId: string,
    checkoutData: CheckoutDTO,
  ): Promise<{ clientSecret: string; paymentIntentId: Types.ObjectId }> {
    const { shippingAddress, paymentMethod } = checkoutData;
    const cartData = await cartService.getCart(userId);
    const cart: ICart = {
      ...cartData,
      user: typeof cartData.user === 'string' ? new Types.ObjectId(cartData.user) : cartData.user,
      items: cartData.items.map((item: ICartItem) => ({
        ...item,
        product: typeof item.product === 'string' ? new Types.ObjectId(item.product) : item.product,
        variant: item.variant.map((v) => ({
          name: v.name,
          value: v.value,
        })),
      })),
    };

    if (!cart.items.length) {
      throw new Error('Cart is empty');
    }

    // Check stock for each product-variant combination
    await Promise.all(
      cart.items.map(async (item: ICartItem) => {
        const inventory = await Inventory.findOne({
          product: item.product,
          variant: {
            $all: item.variant.map(({ name, value }) => ({ $elemMatch: { name, value } })),
          },
        });

        if (!inventory) {
          throw new Error(
            `Product ${item.product.toString()} with variant ${JSON.stringify(item.variant)} not found in inventory`,
          );
        }

        if (inventory.stock < item.quantity) {
          throw new Error(
            `Product ${item.product.toString()} with variant ${JSON.stringify(item.variant)} is out of stock`,
          );
        }
      }),
    );

    const totalAmount = await this.calculateTotal(cart.items);

    let paymentIntent: Stripe.PaymentIntent;
    if (paymentMethod === 'stripe') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        metadata: {
          userId,
          cartId: cart._id ? cart._id.toString() : '',
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

  private async calculateTotal(items: ICartItem[]): Promise<number> {
    const total = await items.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product.toString()} not found`);
      }

      // Find the variant's price
      let variantPrice = 0;
      const matchingVariant = product.variants.find((variant) =>
        item.variant.every((v) =>
          variant.options.some((opt) => opt.value === v.value && variant.name === v.name),
        ),
      );

      if (matchingVariant) {
        const matchingOption = matchingVariant.options.find((option) =>
          item.variant.some((v) => option.value === v.value),
        );
        if (matchingOption) {
          variantPrice = matchingOption.price;
        }
      }

      if (variantPrice === 0) {
        throw new Error(
          `Price not found for product ${item.product.toString()} variant ${JSON.stringify(item.variant)}`,
        );
      }

      return acc + variantPrice * item.quantity;
    }, Promise.resolve(0));

    return total;
  }
}

export const checkoutService = new CheckoutService();
