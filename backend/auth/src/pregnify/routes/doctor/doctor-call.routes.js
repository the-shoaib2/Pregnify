import express from 'express';
import { isAuthenticated } from '../../../middlewares/auth/auth.middleware.js';
import { startCall, endCall, getCallDetails, getCallHistory } from '../../controllers/doctor/doctor-call.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Start call
router.post('/', startCall);

// End call
router.post('/:callId/end', endCall);

// Get call by ID
router.get('/:callId', getCallDetails);

// Get all calls
router.get('/', getCallHistory);

export default router; 