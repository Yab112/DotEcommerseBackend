import Joi from 'joi';

export const addToCartSchema = Joi.object({
  product: Joi.string().required().hex().length(24),
  quantity: Joi.number().min(1).required(),
});

export const updateCartItemSchema = Joi.object({
  product: Joi.string().required().hex().length(24),
  quantity: Joi.number().min(1).required(),
});

// Update to validate itemId in req.params
export const removeCartItemSchema = Joi.object({
  itemId: Joi.string().required().hex().length(24),
}).unknown(true);
