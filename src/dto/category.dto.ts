import { Types } from 'mongoose';

export interface ICategory {
  name: string;
  description?: string;
  parent?: Types.ObjectId;
}
