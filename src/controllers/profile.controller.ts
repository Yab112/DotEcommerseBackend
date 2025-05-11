import { Request, Response } from 'express';
import logger from '@/services/logger.service';
import { profileService } from '@/services/profile.service';
import { UpdateProfileDTO } from '@/dto/profile.dto';

export class ProfileController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logger.error('User ID not found in request');
        throw new Error('Unauthorized');
      }
      const profile = await profileService.getProfile(userId);
      res.status(200).json({ data: profile });
    } catch (error) {
      logger.error('Error in getProfile controller', { error });
      const err = error as Error;
      res.status(err.message === 'User not found' ? 404 : 500).json({
        error: (error as Error).message || 'Internal server error',
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logger.error('User ID not found in request');
        throw new Error('Unauthorized');
      }
      const updateData = req.body as UpdateProfileDTO;
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth).toISOString();
      }
      const updatedProfile = await profileService.updateProfile(userId, updateData);
      res.status(200).json({ data: updatedProfile });
    } catch (error) {
      logger.error('Error in getProfile controller', { error });
      const err = error as Error;
      res.status(err.message === 'User not found' ? 404 : 500).json({
        error: (error as Error).message || 'Internal server error',
      });
    }
  }

  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logger.error('User ID not found in request');
        throw new Error('Unauthorized');
      }
      await profileService.deleteProfile(userId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error in getProfile controller', { error });
      const err = error as Error;
      res.status(err.message === 'User not found' ? 404 : 500).json({
        error: (error as Error).message || 'Internal server error',
      });
    }
  }
}

export const profileController = new ProfileController();
