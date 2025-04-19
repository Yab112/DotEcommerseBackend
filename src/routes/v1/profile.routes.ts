import { Router } from 'express';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { authenticate } from '@/middleware/auth.middleware';
import { profileController } from '@/controllers/profile.controller';

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API for managing user profiles
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the profile of the authenticated user
 *     description: This endpoint retrieves the profile information of the currently authenticated user.
 *                  It requires a valid bearer token for authentication.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - The user is not authenticated
 *       404:
 *         description: User not found - The user profile does not exist
 *       500:
 *         description: Internal server error - An unexpected error occurred
 *   patch:
 *     summary: Update the profile of the authenticated user
 *     description: This endpoint allows the authenticated user to update their profile information.
 *                  The request body should include the fields to be updated.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileDTO'
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - The user is not authenticated
 *       404:
 *         description: User not found - The user profile does not exist
 *       500:
 *         description: Internal server error - An unexpected error occurred
 *   delete:
 *     summary: Delete the profile of the authenticated user
 *     description: This endpoint deletes the profile of the currently authenticated user.
 *                  Once deleted, the user account cannot be recovered.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully deleted user profile
 *       401:
 *         description: Unauthorized - The user is not authenticated
 *       404:
 *         description: User not found - The user profile does not exist
 *       500:
 *         description: Internal server error - An unexpected error occurred
 */

const ProfileRoute = Router();

(async () => {
  const authRateLimiterMiddleware = await authRateLimiter();

  // Protected routes - require authentication
  ProfileRoute.get('/', authRateLimiterMiddleware, authenticate, profileController.getProfile);
  ProfileRoute.patch('/', authRateLimiterMiddleware, authenticate, profileController.updateProfile);
  ProfileRoute.delete(
    '/',
    authRateLimiterMiddleware,
    authenticate,
    profileController.deleteProfile,
  );
})();

export default ProfileRoute;
