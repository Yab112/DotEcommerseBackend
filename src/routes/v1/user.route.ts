import { Router } from 'express';
import { registerUser, loginUser } from '../../controllers/User.controller';
import { errorHandler } from '@/middleware/errorHandler';

const Userrouter = Router();

Userrouter.post('/register',errorHandler, registerUser);
Userrouter.post('/login', loginUser);

export default Userrouter;