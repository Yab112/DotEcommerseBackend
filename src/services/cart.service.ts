// src/services/cart.service.ts
import Cart from '@/models/cart.model';
import { AddToCartDTO, UpdateCartItemDTO, ICart, ICartData } from '@/dto/cart.dto';
import { setRedisValue, getRedisValue } from '@/utils/redis.utils';
import logger from '@/services/logger.service';
import mongoose from 'mongoose';
import Product from '@/models/product.model';

class CartService {
  private readonly CART_CACHE_EXPIRES_IN = 3600;

  private getCacheKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<ICartData> {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cachedCart = await getRedisValue<ICartData>(cacheKey);
      if (cachedCart) {
        logger.info(`Cache hit for ${cacheKey}`);
        return cachedCart;
      }

      logger.info(`Cache miss for ${cacheKey}, fetching from DB`);
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      const cartData: ICartData = cart
        ? {
            user: cart.user,
            items: cart.items,
            _id: cart._id,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
          }
        : {
            user: new mongoose.Types.ObjectId(userId),
            items: [],
            _id: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

      await setRedisValue(cacheKey, cartData, this.CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error fetching cart for user ${userId}:`, error);
      throw new Error('Failed to fetch cart');
    }
  }

  async addToCart(userId: string, item: AddToCartDTO): Promise<ICartData> {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product ${item.product} not found`);
    }

    const variant = product.variants.find(
      (v) => v.name === item.variantName && v.value === item.variantValue,
    );
    if (!variant) {
      throw new Error(
        `Variant ${item.variantName}:${item.variantValue} not found for product ${item.product}`,
      );
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product} variant ${item.variantName}:${item.variantValue}`,
      );
    }

    const cacheKey = this.getCacheKey(userId);

    try {
      const existingCart = await Cart.findOne({ user: userId });
      let updatedCart: ICart;

      if (!existingCart) {
        updatedCart = await Cart.create({
          user: userId,
          items: [
            {
              product: item.product,
              variantName: item.variantName,
              variantValue: item.variantValue,
              quantity: item.quantity,
              price: item.price,
              images: item.images || [],
            },
          ],
        });
      } else {
        const existingItem = existingCart.items.find(
          (i) =>
            i.product.toString() === item.product &&
            i.variantName === item.variantName &&
            i.variantValue === item.variantValue,
        );

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          existingCart.items.push({
            _id: new mongoose.Types.ObjectId(), // Explicitly generate _id for new item
            product: item.product,
            variantName: item.variantName,
            variantValue: item.variantValue,
            quantity: item.quantity,
            price: item.price,
            images: item.images || [],
          });
        }
        updatedCart = await existingCart.save();
      }

      const cartData: ICartData = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
        createdAt: updatedCart.createdAt,
        updatedAt: updatedCart.updatedAt,
      };
      await setRedisValue(cacheKey, cartData, this.CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error adding item to cart for user ${userId}:`, error);
      throw new Error('Failed to add item to cart');
    }
  }

  async updateCartItem(userId: string, item: UpdateCartItemDTO): Promise<ICartData> {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      const cartItem = cart.items.find(
        (i) =>
          i.product.toString() === item.product &&
          i.variantName === item.variantName &&
          i.variantValue === item.variantValue,
      );

      if (!cartItem) {
        logger.error(
          `Item ${item.product} with variant ${item.variantName}:${item.variantValue} not found in cart for user ${userId}`,
        );
        throw new Error('Item not found in cart');
      }

      cartItem.quantity = item.quantity;
      const updatedCart = await cart.save();

      const cartData: ICartData = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
        createdAt: updatedCart.createdAt,
        updatedAt: updatedCart.updatedAt,
      };
      await setRedisValue(cacheKey, cartData, this.CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error updating cart item for user ${userId}:`, error);
      throw new Error('Failed to update cart item');
    }
  }

  async removeFromCart(userId: string, itemId: string): Promise<ICartData> {
    const cacheKey = this.getCacheKey(userId);

    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        logger.error(`Cart not found for user ${userId}`);
        throw new Error('Cart not found');
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (i) => !(i._id instanceof mongoose.Types.ObjectId && i._id.equals(itemId)),
      );

      if (cart.items.length === initialLength) {
        logger.error(`Item with ID ${itemId} not found in cart for user ${userId}`);
        throw new Error('Item not found in cart');
      }

      const updatedCart = await cart.save();

      const cartData: ICartData = {
        user: updatedCart.user,
        items: updatedCart.items,
        _id: updatedCart._id,
        createdAt: updatedCart.createdAt,
        updatedAt: updatedCart.updatedAt,
      };
      await setRedisValue(cacheKey, cartData, this.CART_CACHE_EXPIRES_IN);
      return cartData;
    } catch (error) {
      logger.error(`Error removing item with ID ${itemId} from cart for user ${userId}:`, error);
      throw new Error('Failed to remove item from cart');
    }
  }
}

export const cartService = new CartService();
