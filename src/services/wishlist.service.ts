// File: src/services/wishlist.service.ts
import Wishlist from '@/models/wishlist.model';
import { setRedisValue, getRedisValue, deleteRedisValue } from '@/utils/redis.utils';

const REDIS_WISHLIST_PREFIX = 'wishlist:user:';

class WishlistService {
  private getCacheKey(userId: string) {
    return `${REDIS_WISHLIST_PREFIX}${userId}`;
  }

  async getWishlist(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await getRedisValue(cacheKey);
    if (cached) return cached;

    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    if (!wishlist) return [];

    await setRedisValue(cacheKey, wishlist.products, 3600);
    return wishlist.products;
  }

  async addProduct(userId: string, productId: string) {
    const updated = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true },
    ).populate('products');

    await setRedisValue(this.getCacheKey(userId), updated.products, 3600);
    return updated.products;
  }

  async removeProduct(userId: string, productId: string) {
    const updated = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true },
    ).populate('products');

    await setRedisValue(this.getCacheKey(userId), updated?.products ?? [], 3600);
    return updated?.products ?? [];
  }

  async clearWishlist(userId: string) {
    await Wishlist.findOneAndUpdate({ user: userId }, { products: [] });
    await deleteRedisValue(this.getCacheKey(userId));
  }
}

export const wishlistService = new WishlistService();
