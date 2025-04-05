import express from 'express';
import { testController } from '../controllers/test.controller.js';

const router = express.Router();

// Test Routes
// router.get('/hello', testController.helloMessage);
router.post('/', testController.aiResponse);

export default router; 