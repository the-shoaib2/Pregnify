import prisma from '../../utils/prisma.js';
import asyncHandler from '../../utils/async.handler.js';
import ApiError from '../../utils/api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

export const verifyOTP = asyncHandler(async (req, res) => {
    const { userId, code, method } = req.body;
    const now = new Date();

    // Get verification from session (validated in middleware)
    const verification = req.verificationSession;

    // Mark verification as used
    const updatedVerification = await prisma.passwordResetVerification.update({
        where: { id: verification.id },
        data: { 
            isUsed: true,
            usedAt: now,
            verifiedAt: now,
            verified: true
        },
        include: {
            forgotPassword: {
                select: {
                    token: true,
                    expiresAt: true
                }
            }
        }
    });

    // Add success details for activity log
    req.activityDetails = {
        verificationId: verification.id,
        method,
        success: true
    };

    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Code verified successfully',
        data: {
            token: updatedVerification.forgotPassword.token,
            expiresAt: updatedVerification.forgotPassword.expiresAt
        }
    });
}); 