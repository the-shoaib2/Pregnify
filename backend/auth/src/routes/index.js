import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { cors, corsOptions } from '../utils/middleware/cors.utils.js';
import { createMorganLogger } from '../utils/system/morgan.utils.js';
import { ORIGIN } from '../constants/index.js';
import logger from '../logger/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiLimiter } from '../middlewares/rate-limit/rate.limiter.js';

// System Router 
import healthRoutes from './v1/system-routes/health.routes.js';
import docsRoutes from './v1/system-routes/docs.routes.js';
import enumRoutes from './v1/system-routes/enum.routes.js';

// Auth Router 
import authRoutes from './v1/auth-routes/auth.routes.js';
import verificationRoutes from './v1/auth-routes/verification.routes.js';
import adminRoutes from './v1/admin-routes/admin.routes.js';

// Accounts Router 
import accountRoutes from './v1/account-routes/index.js';

//Media Router 
import mediaRoutes from './v1/media-routes/media.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Security middleware
router.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", ...ORIGIN]  
        }
    }
}));

router.use(cors(corsOptions));

router.use(compression());

// Serve static files
router.use(express.static(path.join(__dirname, '../public')));
router.use(express.static(path.join(__dirname, '../')));  // Allow serving from root

// Add a specific route for test-passkey.html
router.get('/test-passkey', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test-passkey.html'));
});

// Request logging
router.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
});

// Body parsing
router.use(express.json({ limit: '50kb' }));
router.use(express.urlencoded({ extended: true }));

// Apply Morgan logger
createMorganLogger(router);

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Apply general rate limiting to all API routes
router.use('/api', apiLimiter);

router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/enums`, enumRoutes);

// Documentation routes
router.use(`${API_PREFIX}/docs`, docsRoutes);

// Mount routes
// Public routes first
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/verification`, verificationRoutes);
// router.use(`${API_PREFIX}/2fa`, twoFactorRoutes);
// Protected routes after
router.use(`${API_PREFIX}/admin`, adminRoutes);
router.use(`${API_PREFIX}/media`, mediaRoutes);
router.use(`${API_PREFIX}/account`, accountRoutes);

export default router;
