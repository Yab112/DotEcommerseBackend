import Joi from 'joi';

export const addToCartSchema = Joi.object({
  product: Joi.string().required().hex().length(24),
  variantName: Joi.string().required(),
  variantValue: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateCartItemSchema = Joi.object({
  product: Joi.string().required().hex().length(24),
  variantName: Joi.string().required(),
  variantValue: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
});

export const removeCartItemSchema = Joi.object({
  itemId: Joi.string().required().hex().length(24),
}).unknown(true);
