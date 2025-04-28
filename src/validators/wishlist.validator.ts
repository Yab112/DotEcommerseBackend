import Joi from 'joi';

export const addToWishlistSchema = Joi.object({
  product: Joi.string().required(),
  variant: Joi.object({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }).required(),
  price: Joi.number().required(),
  images: Joi.array().items(Joi.string()).required(),
});

export const removeFromWishlist = Joi.object({
  productId: Joi.string().required(),
  variant: Joi.object({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }).required(),
});
