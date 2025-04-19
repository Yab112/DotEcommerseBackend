import logger from '@/services/logger.service';
import User from '@/models/User.nodel';
import { IUser } from '@/dto/user.dto';
import { UpdateProfileDTO } from '@/dto/profile.dto';

export class ProfileService {
  async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password -googleId');
      if (!user) {
        logger.error(`User not found for ID: ${userId}`);
        throw new Error('User not found');
      }
      logger.info(`Profile retrieved for user ID: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error fetching profile for user ID: ${userId}`, { error });
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: UpdateProfileDTO): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate<IUser>(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      )?.select('-password -googleId');
      if (!user) {
        logger.error(`User not found for ID: ${userId}`);
        throw new Error('User not found');
      }
      logger.info(`Profile updated for user ID: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error updating profile for user ID: ${userId}`, { error });
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        logger.error(`User not found for ID: ${userId}`);
        throw new Error('User not found');
      }
      logger.info(`Profile deleted for user ID: ${userId}`);
    } catch (error) {
      logger.error(`Error deleting profile for user ID: ${userId}`, { error });
      throw error;
    }
  }
}

export const profileService = new ProfileService();
