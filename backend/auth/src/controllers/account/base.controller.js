import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';


/**
 * @description Retrieves the current user's profile
 * @throws {ApiError} If the user is not found
 * @throws {ApiError} If there is a database error
 * @throws {ApiError} If the user data is invalid
 * @returns {Promise<void>}
 * 
 * @example
 *  getCurrentUser(req, res);
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw ApiError.unauthorized('No user found');
        }

        // Get user data with related information
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                // Basic Information
                id: true,
                userID: true,
                username: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                avatarThumb: true,
                isVerified: true,
                isEmailVerified: true,
                isSmsVerified: true,
                multiFactorAuth: true,
                createdAt: true,
                updatedAt: true,
                lastActive: true, // Changed from lastLoginAt to lastActive

                // Relations
                personalInformation: {
                    select: {
                        firstName: true,
                        lastName: true,
                        genderIdentity: true,
                        dateOfBirth: true,
                        address: true,
                        contactNumber: true,
                        description: true
                    }
                },
                preferences: {
                    select: {
                        preferences: true,
                        notifications: true,
                        settings: true,
                        customization: true,
                        theme: true,
                        language: true,
                        isDarkModeEnabled: true
                    }
                },
                activityLogSettings: true,
                notificationPreferences: true,
                sessions: {
                    where: {
                        isActive: true,
                        isRevoked: false,
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        deviceId: true,
                        ipAddress: true,
                        userAgent: true,
                        isActive: true,
                        isRevoked: true,
                        isExpired: true,
                        createdAt: true,
                        updatedAt: true,
                        accessTokenExpiresAt: true,
                        refreshTokenExpiresAt: true
                    }
                },
                oauthCredentials: true,
                passwordHistory: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        createdAt: true
                    }
                },
                securityQuestions: true,
                userConsent: true,
                deviceTokens: true,
                auditLogs: {
                    orderBy: { timestamp: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        action: true,
                        details: true,
                        timestamp: true
                    }
                },
                roles: true,
                emergencyContacts: {
                    select: {
                        id: true,
                        name: true,
                        relation: true,
                        phone: true
                    }
                },
                documents: true,
                paymentCards: {
                    select: {
                        id: true,
                        cardNumber: true,
                        cardHolder: true,
                        expiryDate: true
                    }
                },
                loginHistory: {
                    orderBy: { loginAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        ipAddress: true,
                        userAgent: true,
                        deviceType: true,
                        loginAt: true,
                        successful: true
                    }
                },
                passwordPolicy: true,
                membershipTier: true,
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        currency: true,
                        status: true,
                        method: true,
                        createdAt: true
                    }
                },
                subscriptions: {
                    select: {
                        id: true,
                        plan: true,
                        status: true,
                        expiresAt: true,
                        autoRenew: true
                    }
                }
            }
        });

        if (!userData) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
        }

        // Return success response
        res.status(HTTP_STATUS.OK).json({
            message: "User authenticated successfully",
            success: true,
            user: {
                // Basic Information
                id: userData.id,
                userID: userData.userID,
                username: userData.username,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                role: userData.role,
                avatar: userData.avatar,
                avatarThumb: userData.avatarThumb,
                name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),

                // Profile Information
                personalInformation: userData.personalInformation,
                preferences: userData.preferences,

                // Security Settings
                isVerified: userData.isVerified,
                isEmailVerified: userData.isEmailVerified,
                isSmsVerified: userData.isSmsVerified,
                multiFactorAuth: userData.multiFactorAuth,

                // Activity Information
                activityLogSettings: userData.activityLogSettings,
                notificationPreferences: userData.notificationPreferences,

                // Payment Information
                paymentCards: userData.paymentCards,
                membershipTier: userData.membershipTier,

                // Session Information
                activeSessions: userData.sessions,

                // Login History
                loginHistory: userData.loginHistory
            }
        });

    } catch (err) {
        console.error('Get current user error:', err);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch user details");
    }
});

export default getCurrentUser; 