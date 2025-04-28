// controllers/checkout.controller.ts
import { checkoutService } from '@/services/checkout.service';
import { CheckoutDTO } from '@/types/checkout.type';
import { Request, Response } from 'express';
import { cartService } from '@/services/cart.service';

class CheckoutController {
  async initiateCheckout(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const checkoutData = req.body as CheckoutDTO;

    // Validate that the cart is not empty before proceeding
    const cart = await cartService.getCart(userId);
    if (!cart.items.length) {
      throw new Error('Cart is empty');
    }

    const { clientSecret } = await checkoutService.initiateCheckout(userId, checkoutData);

    res.status(200).json({ clientSecret });
  }
}

export const checkoutController = new CheckoutController();
