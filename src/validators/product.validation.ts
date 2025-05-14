// src/validations/product.validation.ts
import Joi from 'joi';

// Common schemas
const dimensionsSchema = Joi.object({
  length: Joi.number().min(0).required(),
  width: Joi.number().min(0).required(),
  height: Joi.number().min(0).required(),
});

const variantSchema = Joi.object({
  name: Joi.string().required(),
  options: Joi.array().items(Joi.string().required()).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  color: Joi.string().required(),
  size: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'child', 'unisex').required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  attributes: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required()
    })
  ).optional()
});

const specificationSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
});

// 1. Create Product
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().required(),
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  category: Joi.string().required(),
  subCategory: Joi.string().optional(),
  brand: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  variants: Joi.array().items(variantSchema).optional(),
  specifications: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required()
    })
  ).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  weight: Joi.number().min(0).optional(),
  dimensions: Joi.object({
    length: Joi.number().min(0).required(),
    width: Joi.number().min(0).required(),
    height: Joi.number().min(0).required()
  }).optional(),
  isFeatured: Joi.boolean().optional()
});

// 2. Update Product
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10),
  sku: Joi.string(),
  price: Joi.number().min(0),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().min(0),
  category: Joi.string(),
  subCategory: Joi.string(),
  brand: Joi.string(),
  images: Joi.array().items(Joi.string().uri()).min(1),
  variants: Joi.array().items(variantSchema),
  specifications: Joi.array().items(specificationSchema),
  tags: Joi.array().items(Joi.string()),
  weight: Joi.number().min(0),
  dimensions: dimensionsSchema,
  isFeatured: Joi.boolean(),
});

// 3. Update Stock
export const updateProductStockSchema = Joi.object({
  stock: Joi.number().min(0).required()
});

// 4. Add Review
export const addReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  userId: Joi.string().required()
});

// 5. Delete Review (if applicable)
export const deleteReviewSchema = Joi.object({
  reviewId: Joi.string().required()
});

// 6. Add Variant (if managed independently)
export const addVariantSchema = Joi.object({
  productId: Joi.string().required(),
  variant: variantSchema.required(),
});

// 7. Update Variant
export const updateVariantSchema = Joi.object({
  variantId: Joi.string().required(),
  name: Joi.string().optional(),
  options: Joi.array().items(Joi.string()).optional()
});

// 8. Bulk Stock Update (Optional)
export const bulkUpdateStockSchema = Joi.array().items(
  Joi.object({
    productId: Joi.string().required(),
    stock: Joi.number().min(0).required()
  })
);

// 9. Filter Products
export const filterProductsSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).optional(),
  sort: Joi.string().optional(),
  category: Joi.string().optional(),
  brand: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  isFeatured: Joi.boolean().optional(),
  status: Joi.string().valid('active', 'draft', 'out_of_stock', 'discontinued').optional()
});
