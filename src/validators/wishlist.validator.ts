import Joi from 'joi';

export const addToWishlistSchema = Joi.object({
  productId: Joi.string().required(),
});

export const removeFromWishlist = Joi.object({
  ItemId: Joi.string().required(),
});
