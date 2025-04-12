import prisma from '../database/prisma.js'

/**
 * @description Generates a unique user ID based on role and current count
 * @param {string} role - User role (e.g., 'USER', 'ADMIN', etc.)
 * @returns {Promise<string>} Generated user ID
 */
export const generateUserID = async (role) => {
    try {
        // Get the count of existing users with the same role
        const userCount = await prisma.user.count({
            where: { role: role.toUpperCase() }
        });

        const rolePrefix = getRolePrefix(role);

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentDay = new Date().getDate();
        const paddedCount = (userCount + 1).toString().padStart(6, '0');
        // Generate the ID with format: ROLE-CURRENTYEAR-SEQUENTIAL_NUMBER

        const userID = `${rolePrefix}-${currentYear}-${currentMonth}-${currentDay}-${paddedCount}`;

        return userID;
    } catch (error) {
        console.error('Error generating userID:', error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate userID');
    }
};

/**
 * @description Gets the prefix for user ID based on role dynamically
 * @param {string} role - User role
 * @returns {string} Role prefix
 */
export const getRolePrefix = (role) => {
    if (!role || typeof role !== 'string') return 'USR';
    
    return role.toUpperCase().slice(0, 3); 
};
