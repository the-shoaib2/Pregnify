import ApiError from '../../../utils/api.error.js';
import asyncHandler from '../../../utils/async.handler.js';
import prisma from '../../../utils/prisma.js';

/**
 * @description Handles user account recovery
 * @param {Object} req - The request object containing user recovery details
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const recoverAccount = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Logic to recover the account (e.g., sending a recovery email)
        // This could involve generating a recovery token and sending an email

        res.status(200).json({ message: 'Recovery instructions sent to your email.' });
    } catch (err) {
        throw new ApiError(500, err.message || "Internal server error");
    }
});