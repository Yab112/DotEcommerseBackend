// validators/checkout.validator.ts
import Joi from 'joi';

export const initiateCheckoutSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().hex().length(24),
        variantId: Joi.string().required().hex().length(24),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      }),
    )
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().min(1).max(100).required(),
    city: Joi.string().min(1).max(50).required(),
    state: Joi.string().min(1).max(50).required(),
    postalCode: Joi.string().min(1).max(20).required(),
    country: Joi.string().min(1).max(50).required(),
  }).required(),
  paymentMethod: Joi.string().valid('stripe', 'paypal').required(),
});
