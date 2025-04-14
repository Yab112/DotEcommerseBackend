// category.model.ts
import { Schema, model } from 'mongoose';

import type { ICategory } from '@/dto/category.dto';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
  },
  { timestamps: true },
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;
