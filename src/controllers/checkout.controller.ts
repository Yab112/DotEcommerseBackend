// controllers/checkout.controller.ts
import { checkoutService } from '@/services/checkout.service';
import { CheckoutDTO } from '@/types/checkout.type';
import { Request, Response } from 'express';

class CheckoutController {
  async initiateCheckout(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const checkoutData = req.body as CheckoutDTO;

    const { clientSecret, paymentIntentId } = await checkoutService.initiateCheckout(
      userId,
      checkoutData,
    );
    res.json({ clientSecret, paymentIntentId });
  }
}

export const checkoutController = new CheckoutController();
