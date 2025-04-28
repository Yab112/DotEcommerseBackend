// File: src/controllers/wishlist.controller.ts
import { Request, Response } from 'express';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';

class WishlistController {
  getWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const wishlist = await wishlistService.getWishlist(userId);
    res.status(200).json({ data: wishlist });
  };

  addToWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { product, variant, price, images } = req.body as {
      product: string;
      variant: { name: string; value: string };
      price: number;
      images: string[];
    };
    const wishlist = await wishlistService.addProduct(userId, {
      product,
      variant,
      price,
      images,
    });
    res.status(200).json({ data: wishlist });
  };

  removeFromWishlist = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const { productId, variant } = req.body as {
      productId: string;
      variant: { name: string; value: string };
    };
    const wishlist = await wishlistService.removeProduct(userId, {
      productId,
      variant,
    });
    res.status(200).json({ data: wishlist });
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
    const { productId, variantName, variantValue } = req.params;

    // Remove product from wishlist and add to cart
    const productDetails = await wishlistService.removeProduct(userId, {
      productId,
      variant: {
        name: variantName,
        value: variantValue,
      },
    });

    const updatedCart = await cartService.addToCart(userId, {
      product: productId,
      variantName,
      variantValue,
      quantity: 1,
      price: typeof productDetails?.price === 'number' ? productDetails.price : 0,
      images: Array.isArray(productDetails?.images) ? productDetails.images : [],
    });

    res.status(200).json({ data: updatedCart });
  };
}

export const wishlistController = new WishlistController();
