import User from '../models/User.nodel';
import type IUser from '../models/User.nodel';

export const createUser = async (userData: Partial<typeof IUser>) => {
  return User.create(userData);
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

// Add other user-related services
