// services/cart.service.ts
import Cart from '@/models/cart.model';
import Inventory from '@/models/inventory.model';
import { AddToCartDTO, UpdateCartItemDTO, ICart } from '@/dto/cart.dto';
import { setRedisValue, getRedisValue } from '@/utils/redis.utils';
import logger from '@/services/logger.service';
import mongoose from 'mongoose';

const CART_CACHE_EXPIRES_IN = 3600;

class CartService {
  private getCacheKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<ICart> {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cachedCart = await getRedisValue<ICart>(cacheKey);
      if (cachedCart) {
        logger.info(`Cache hit for ${cacheKey}`);
        return cachedCart;
      }

      logger.info(`Cache miss for ${cacheKey}, fetching from DB`);
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      const cartData: ICart = cart
        ? { user: cart.user, items: cart.items, _id: cart._id }
        : { user: new mongoose.Types.ObjectId(userId), items: [] };

      await setRedisValue(cacheKey, cartData, CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error fetching cart for user ${userId}:`, error);
      throw new Error('Failed to fetch cart');
    }
  }

  async addToCart(userId: string, item: AddToCartDTO): Promise<ICart> {
    const cacheKey = this.getCacheKey(userId);

    try {
      // Validate stock in Inventory
      const inventory = await Inventory.findOne({
        product: item.product,
        variant: {
          $all: item.variant.map(({ name, value }) => ({ $elemMatch: { name, value } })),
        },
      });

      if (!inventory) {
        throw new Error(
          `Product ${item.product} with variant ${JSON.stringify(item.variant)} not found in inventory`,
        );
      }

      if (inventory.stock < item.quantity) {
        throw new Error(
          `Product ${item.product} with variant ${JSON.stringify(item.variant)} is out of stock`,
        );
      }

      const existingCart = await Cart.findOne({ user: userId });
      let updatedCart;

      if (!existingCart) {
        updatedCart = await Cart.create({
          user: userId,
          items: [{ product: item.product, variant: item.variant, quantity: item.quantity }],
        });
      } else {
        const existingItem = existingCart.items.find(
          (i) =>
            i.product.toString() === item.product &&
            i.variant.every((v) =>
              item.variant.some((iv) => iv.name === v.name && iv.value === v.value),
            ),
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          existingCart.items.push({
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,
          });
        }
        updatedCart = await existingCart.save();
      }

      // Update cache
      const cartData: ICart = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
      };
      await setRedisValue(cacheKey, cartData, CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error adding item to cart for user ${userId}:`, error);
      throw new Error('Failed to add item to cart');
    }
  }

  async updateCartItem(userId: string, item: UpdateCartItemDTO): Promise<ICart> {
    const cacheKey = this.getCacheKey(userId);

    try {
      // Validate stock in Inventory
      const inventory = await Inventory.findOne({
        product: item.product,
        variant: {
          $all: item.variant.map(({ name, value }) => ({ $elemMatch: { name, value } })),
        },
      });

      if (!inventory) {
        throw new Error(
          `Product ${item.product} with variant ${JSON.stringify(item.variant)} not found in inventory`,
        );
      }

      if (inventory.stock < item.quantity) {
        throw new Error(
          `Product ${item.product} with variant ${JSON.stringify(item.variant)} is out of stock`,
        );
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      const cartItem = cart.items.find(
        (i) =>
          i.product.toString() === item.product &&
          i.variant.every((v) =>
            item.variant.some((iv) => iv.name === v.name && iv.value === v.value),
          ),
      );
      if (!cartItem) {
        logger.error(
          `Item ${item.product} with variant ${JSON.stringify(item.variant)} not found in cart for user ${userId}`,
        );
        throw new Error('Item not found in cart');
      }

      cartItem.quantity = item.quantity;
      const updatedCart = await cart.save();

      // Update cache
      const cartData: ICart = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
      };
      await setRedisValue(cacheKey, cartData, CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error updating cart item for user ${userId}:`, error);
      throw new Error('Failed to update cart item');
    }
  }

  async removeFromCart(userId: string, itemId: string): Promise<ICart> {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      logger.info(`Cart found for user ${userId}: ${JSON.stringify(cart.items)}`);

      const initialLength = cart.items.length;
      cart.items = cart.items.filter((i) => {
        return !(i._id instanceof mongoose.Types.ObjectId && i._id.equals(itemId));
      });

      if (cart.items.length === initialLength) {
        logger.error(`Item with ID ${itemId} not found in cart for user ${userId}`);
        logger.info(`Current cart items: ${JSON.stringify(cart.items)}`);
        throw new Error('Item not found in cart');
      }

      const updatedCart = await cart.save();

      // Update cache
      const cartData: ICart = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
      };
      await setRedisValue(cacheKey, cartData, CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error removing item with ID ${itemId} from cart for user ${userId}:`, error);
      throw new Error('Failed to remove item from cart');
    }
  }
}

export const cartService = new CartService();
