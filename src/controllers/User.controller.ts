import { Request, Response } from 'express';
import User from '../models/User';
import { createUserSchema } from '../validators/user.validator';
import { generateAuthToken } from '../utils/auth';  // Import the utils
import { comparePassword, hashPassword } from '@/utils/passwordUtils';

// Register user function
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash the password before saving the user
    const hashedPassword = await hashPassword(password);

    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = generateAuthToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user function
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare the password with the hashed password from the database
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateAuthToken(user._id, user.role);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
