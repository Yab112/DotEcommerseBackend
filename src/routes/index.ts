import { Router } from 'express';
import healthRouter from './v1/health';

const router = Router();

router.use(healthRouter);

export default router;
