import User from '../models/User.nodel';
import IUser from '../models/User.nodel';

export const createUser = async (userData: Partial<typeof IUser>) => {
  return await User.create(userData);
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Add other user-related services
