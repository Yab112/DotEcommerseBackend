// File: src/controllers/wishlist.controller.ts
import { Request, Response } from 'express';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';

class WishlistController {
  getWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const products = await wishlistService.getWishlist(userId);
    res.status(200).json({ data: products });
  };

  addToWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const productId = req.body as string;
    const products = await wishlistService.addProduct(userId, productId);
    res.status(200).json({ data: products });
  };

  removeFromWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { productId } = req.params;
    const products = await wishlistService.removeProduct(userId, productId);
    res.status(200).json({ data: products });
  };

  clearWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    await wishlistService.clearWishlist(userId);
    res.status(204).send();
  };

  moveToCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { productId } = req.params;

    // Remove product from wishlist and add to cart
    await wishlistService.removeProduct(userId, productId);
    const updatedCart = await cartService.addToCart(userId, {
      product: productId,
      variant: [],
      quantity: 1,
    });

    res.status(200).json({ data: updatedCart });
  };
}

export const wishlistController = new WishlistController();
