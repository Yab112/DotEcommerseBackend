/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileDTO:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *         bio:
 *           type: string
 *           description: Short biography of the user
 *         phone:
 *           type: string
 *           description: Phone number of the user
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               description: Street address
 *             city:
 *               type: string
 *               description: City
 *             state:
 *               type: string
 *               description: State
 *             postalCode:
 *               type: string
 *               description: Postal code
 *             country:
 *               type: string
 *               description: Country
 */
export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
