import { Router } from 'express';
import authRoutes from './auth.routes.js';
import verificationRoutes from './verification.routes.js';
import twoFactorRoutes from './2fa.routes.js';

const router = Router();

// Mount auth-related routes
router.use('/', authRoutes);
router.use('/', verificationRoutes);
router.use('/', twoFactorRoutes);

// Export as default only
export default router; 