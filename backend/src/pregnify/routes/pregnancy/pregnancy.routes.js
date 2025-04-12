import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { pregnancyController } from '../../controllers/pregnancy/pregnancy.controller.js';


const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// ============================================
// 1. Core Pregnancy Profile Routes
// ============================================
router.post('/', pregnancyController.createPregnancyProfile);
router.get('/active', pregnancyController.getActivePregnancy);
router.get('/', pregnancyController.getUserPregnancy);
router.patch('/:id', pregnancyController.updatePregnancyProfile);
router.put('/:id', pregnancyController.updatePregnancyProfile);
router.get('/history', pregnancyController.getPregnancyHistory);


export default router; 