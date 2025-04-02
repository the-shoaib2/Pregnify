import pkg from '@prisma/client';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * @desc    Get all enums from the system
 * @route   GET /api/v1/system/enums
 * @access  Public
 */
export const getAllEnums = asyncHandler(async (req, res) => {
    try {
        // Retrieve all enums dynamically from the $Enums key
        const enums = Object.keys(pkg['$Enums'] || {})
            .reduce((acc, enumName) => {
                acc[enumName] = Object.keys(pkg['$Enums'][enumName] || []);
                return acc;
            }, {});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Enums retrieved successfully',
            data: enums,
        });

    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error retrieving enums',
            error: error.message,
        });
    }
});

/**
 * @desc    Get specific enum by name
 * @route   GET /api/v1/system/enums/:enumName
 * @access  Public
 */
export const getEnumByName = asyncHandler(async (req, res) => {
    const { enumName } = req.params;

    // Check if the enum exists in the $Enums object
    if (!pkg['$Enums'] || !pkg['$Enums'][enumName]) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: `Enum '${enumName}' not found`,
        });
    }

    // Get the enum values
    const enumValues = Object.keys(pkg['$Enums'][enumName]);

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Enum '${enumName}' retrieved successfully`,
        data: enumValues,
    });
});
