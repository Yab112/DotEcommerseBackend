// services/cart.service.ts
import Cart from '@/models/cart.model';
import { AddToCartDTO, UpdateCartItemDTO } from '@/dto/cart.dto';
import { setRedisValue, getRedisValue } from '@/utils/redis.utils';
import logger from '@/services/logger.service';

const CART_CACHE_EXPIRES_IN = 3600; // 1 hour

class CartService {
  // Generate Redis cache key for a user's cart
  private getCacheKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string) {
    const cacheKey = this.getCacheKey(userId);

    try {
      // Check Redis cache
      const cachedCart = await getRedisValue<{ user: string; items: any[] }>(cacheKey);
      if (cachedCart) {
        logger.info(`Cache hit for ${cacheKey}`);
        return cachedCart;
      }

      // Cache miss, fetch from DB
      logger.info(`Cache miss for ${cacheKey}, fetching from DB`);
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      const cartData = cart ?? { user: userId, items: [] };

      // Cache the result
      await setRedisValue(cacheKey, cartData, CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error fetching cart for user ${userId}:`, error);
      throw new Error('Failed to fetch cart');
    }
  }

  async addToCart(userId: string, item: AddToCartDTO) {
    const cacheKey = this.getCacheKey(userId);

    try {
      const existingCart = await Cart.findOne({ user: userId });
      let updatedCart;

      if (!existingCart) {
        updatedCart = await Cart.create({
          user: userId,
          items: [{ product: item.product, quantity: item.quantity }],
        });
      } else {
        const existingItem = existingCart.items.find((i) => i.product.toString() === item.product);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          existingCart.items.push({ product: item.product, quantity: item.quantity });
        }
        updatedCart = await existingCart.save();
      }

      // Update cache
      await setRedisValue(cacheKey, updatedCart, CART_CACHE_EXPIRES_IN);
      return updatedCart;
    } catch (error) {
      logger.error(`Error adding item to cart for user ${userId}:`, error);
      throw new Error('Failed to add item to cart');
    }
  }

  async updateCartItem(userId: string, item: UpdateCartItemDTO) {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      const cartItem = cart.items.find((i) => i.product.toString() === item.product);
      if (!cartItem) {
        logger.error(`Item ${item.product} not found in cart for user ${userId}`);
        throw new Error('Item not found in cart');
      }

      cartItem.quantity = item.quantity;
      const updatedCart = await cart.save();

      // Update cache
      await setRedisValue(cacheKey, updatedCart, CART_CACHE_EXPIRES_IN);
      return updatedCart;
    } catch (error) {
      logger.error(`Error updating cart item for user ${userId}:`, error);
      throw new Error('Failed to update cart item');
    }
  }

  async removeFromCart(userId: string, itemId: string) {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter((i) => (i._id ?? '').toString() !== itemId);

      if (cart.items.length === initialLength) {
        logger.info(`Item ${itemId} not found in cart for user ${userId}`);
        throw new Error('Item not found in cart');
      }

      const updatedCart = await cart.save();

      // Update cache
      await setRedisValue(cacheKey, updatedCart, CART_CACHE_EXPIRES_IN);
      return updatedCart;
    } catch (error) {
      logger.error(`Error removing item from cart for user ${userId}:`, error);
      throw new Error('Failed to remove item from cart');
    }
  }
}

export const cartService = new CartService();
