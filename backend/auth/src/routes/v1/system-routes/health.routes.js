import express from 'express';
import { healthCheck, ping } from '../../../controllers/health/health.controller.js';
import { apiLimiter } from '../../../middlewares/rate-limit/rate.limiter.js';

const router = express.Router();

// Apply rate limiting to health endpoints
router.use(apiLimiter);

// Health check endpoints
router.get('/', healthCheck);
router.get('/check', healthCheck);
router.get('/ping', ping);


export default router;
