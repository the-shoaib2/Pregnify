import express from 'express';
import { getAllEnums, getEnumByName } from '../../../controllers/system/enum.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/system/enums
 * @desc    Get all enums
 * @access  Public
 */
router.get('/', getAllEnums);

/**
 * @route   GET /api/v1/system/enums/:enumName
 * @desc    Get enum by name
 * @access  Public
 */
router.get('/:enumName', getEnumByName);

export default router; 