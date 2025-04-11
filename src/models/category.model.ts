// category.model.ts
import { ICategory } from '@/dto/category.dto';
import { Document, Schema, model } from 'mongoose';


const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;