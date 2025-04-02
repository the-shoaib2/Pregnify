import ApiError from '../../../utils/api.error.js';
import asyncHandler from '../../../utils/async.handler.js';
import prisma from '../../../utils/prisma.js';

/**
 * @description Handles user account deletion
 * @param {Object} req - The request object containing user session data
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 */
export const deleteUserAccount = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in the request

        const user = await prisma.user.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        await prisma.user.delete({ where: { id: userId } });

        res.status(200).json({ message: 'User account deleted successfully.' });
    } catch (err) {
        throw new ApiError(500, err.message || "Internal server error");
    }
});