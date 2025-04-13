export interface IUser {
  _id?: string;
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
}