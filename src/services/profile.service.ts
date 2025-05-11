import logger from '@/services/logger.service';
import User from '@/models/profile.model';
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
      // Create a new object to avoid mutating the parameter
      const updatedData = { ...updateData };

      if (updatedData.dateOfBirth) {
        const parsedDate = new Date(updatedData.dateOfBirth);
        if (Number.isNaN(parsedDate.getTime())) {
          logger.error(`Invalid date format for dateOfBirth: ${updatedData.dateOfBirth}`);
          throw new Error('Invalid date format for dateOfBirth');
        }
        updatedData.dateOfBirth = parsedDate.toISOString();
      }

      const user = await User.findByIdAndUpdate<IUser>(
        userId,
        { $set: updatedData },
        { new: true, runValidators: true },
      )?.select('-password -googleId');

      if (!user) {
        logger.error(`User not found for ID: ${userId}`);
        throw new Error('User not found');
      }

      logger.info(`Profile updated for user ID: ${userId}`);
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error updating profile for user ID: ${userId}`, {
        error: errorMessage,
      });
      throw error instanceof Error ? error : new Error('Unknown error occurred');
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
