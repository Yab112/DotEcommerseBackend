import { Schema, model, Types } from 'mongoose';
import type { ICategory } from '@/dto/category.dto';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    parent: { type: Types.ObjectId, ref: 'Category' },
  },
  { timestamps: true },
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;
