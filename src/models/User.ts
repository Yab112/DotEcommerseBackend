import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
_id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);