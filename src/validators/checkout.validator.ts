// validators/checkout.validator.ts
import Joi from 'joi';

export const initiateCheckoutSchema = Joi.object({
  shippingAddress: Joi.object({
    street: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Street is required',
      'string.max': 'Street is too long',
    }),
    city: Joi.string().min(1).max(50).required().messages({
      'string.empty': 'City is required',
      'string.max': 'City is too long',
    }),
    state: Joi.string().min(1).max(50).required().messages({
      'string.empty': 'State is required',
      'string.max': 'State is too long',
    }),
    postalCode: Joi.string().min(1).max(20).required().messages({
      'string.empty': 'Postal code is required',
      'string.max': 'Postal code is too long',
    }),
    country: Joi.string().min(1).max(50).required().messages({
      'string.empty': 'Country is required',
      'string.max': 'Country is too long',
    }),
  }).required(),
  paymentMethod: Joi.string().valid('stripe', 'paypal').required().messages({
    'any.only': 'Payment method must be "stripe" or "paypal"',
  }),
});
