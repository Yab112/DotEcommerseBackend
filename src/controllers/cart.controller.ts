// File: src/controllers/cart.controller.ts
import { Request, Response } from 'express';
import { cartService } from '@/services/cart.service';
import { AddToCartDTO, UpdateCartItemDTO } from '@/dto/cart.dto';

class CartController {
  getCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const cart = await cartService.getCart(userId);
    res.status(200).json({ data: cart });
  };

  addToCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const item: AddToCartDTO = req.body as AddToCartDTO;
    const updatedCart = await cartService.addToCart(userId, item);
    res.status(201).json({ data: updatedCart });
  };

  updateCartItem = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');

    const item: UpdateCartItemDTO = req.body as UpdateCartItemDTO;
    const updatedCart = await cartService.updateCartItem(userId, item);
    res.status(200).json({ data: updatedCart });
  };

  removeFromCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { itemId } = req.params;
    if (!userId) throw new Error('Unauthorized');

    const updatedCart = await cartService.removeFromCart(userId, itemId);
    res.status(200).json({ data: updatedCart });
  };
}

export const cartController = new CartController();
