// File: src/services/wishlist.service.ts
import { RemoveProductDTO, RemoveProductResponse } from '@/dto/wishlist.dto';
import Wishlist from '@/models/wishlist.model';
import { setRedisValue, getRedisValue, deleteRedisValue } from '@/utils/redis.utils';
import mongoose from 'mongoose';
import logger from './logger.service';

const REDIS_WISHLIST_PREFIX = 'wishlist:user:';

class WishlistService {
  private getCacheKey(userId: string) {
    return `${REDIS_WISHLIST_PREFIX}${userId}`;
  }

  async getWishlist(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await getRedisValue(cacheKey);
    if (cached)
      return JSON.parse(cached) as {
        products: { product: string; variantName: string; variantValue: string }[];
      };
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
    if (!wishlist) return { products: [] };

    const response = {
      products: wishlist.products,
    };

    await setRedisValue(cacheKey, JSON.stringify(response), 3600);
    return response;
  }

  async addProduct(
    userId: string,
    product: {
      product: string;
      variant: { name: string; value: string };
      price: number;
      images: string[];
    },
  ) {
    const updated = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: product } },
      { new: true, upsert: true },
    ).populate('products.product');

    const response = {
      products: updated.products,
    };

    await setRedisValue(this.getCacheKey(userId), JSON.stringify(response), 3600);
    return response;
  }

  async removeProduct(userId: string, product: RemoveProductDTO): Promise<RemoveProductResponse> {
    try {
      const wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        logger.error(`Wishlist not found for user ${userId}`);
        throw new Error('Wishlist not found');
      }

      const removedProduct = wishlist.products.find(
        (p) =>
          p.product.toString() === product.productId &&
          p.variant.name === product.variant.name &&
          p.variant.value === product.variant.value,
      );

      const updated = await Wishlist.findOneAndUpdate(
        { user: userId },
        {
          $pull: {
            products: {
              product: new mongoose.Types.ObjectId(product.productId),
              variant: product.variant,
            },
          },
        },
        { new: true },
      ).populate('products.product');

      if (!updated) {
        logger.error(`Wishlist not found for user ${userId}`);
        throw new Error('Wishlist not found');
      }

      const response: RemoveProductResponse = {
        products: updated.products || [],
        price: removedProduct?.price,
        images: removedProduct?.images,
      };

      await setRedisValue(this.getCacheKey(userId), JSON.stringify(response), 3600);
      return response;
    } catch (error) {
      logger.error(`Error removing product from wishlist for user ${userId}:`, error);
      throw new Error('Failed to remove product from wishlist');
    }
  }

  async clearWishlist(userId: string) {
    await Wishlist.findOneAndUpdate({ user: userId }, { products: [] });
    await deleteRedisValue(this.getCacheKey(userId));
    return { products: [] };
  }
}

export const wishlistService = new WishlistService();
