export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  googleId?: string;
  loginMethod?: 'password' | 'google' | 'both';
  profilePicture?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  isVerified?: boolean;
  phone?: string;
  orders?: string[];
  cart?: { productId: string; quantity: number }[];
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string; // Added to match controller usage
}

export interface OtpDTO {
  email: string;
  otp: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface VerifyForgotPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface User {
  _id: string | undefined;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
  phone?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user: User;
}
