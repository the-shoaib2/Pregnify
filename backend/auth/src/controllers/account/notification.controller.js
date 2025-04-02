import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { userWebSocketService } from '../../server.js';

/**
 * @desc    Get notification settings
 * @route   GET /api/v1/account/notifications
 */
export const getNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.notificationSettings.findUnique({
        where: { userId },
        select: {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: true,
            marketingEmails: true,
            securityAlerts: true,
            accountUpdates: true,
            deviceAlerts: true,
            loginAlerts: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Notification settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update notification settings
 * @route   PUT /api/v1/account/notifications
 */
export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationSettings.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        // Log the activity
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'NOTIFICATION_SETTINGS_UPDATED',
                description: 'Updated notification settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/v1/account/notifications/preferences
 */
export const getNotificationPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
        select: {
            frequency: true,
            quietHours: true,
            channels: true,
            customPreferences: true
        }
    });

    if (!preferences) {
        throw new ApiError(404, 'Notification preferences not found');
    }

    res.json({
        success: true,
        data: preferences
    });
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/v1/account/notifications/preferences
 */
export const updateNotificationPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const preferences = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...updates
            },
            update: updates
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'NOTIFICATION_PREFERENCES_UPDATED',
                description: 'Updated notification preferences',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences
    });
});

/**
 * @desc    Get email notifications
 * @route   GET /api/v1/account/notifications/email
 */
export const getEmailNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.notificationSettings.findUnique({
        where: { userId },
        select: {
            emailEnabled: true,
            emailFrequency: true,
            emailTypes: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Email notification settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update email notifications
 * @route   PUT /api/v1/account/notifications/email
 */
export const updateEmailNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationSettings.update({
            where: { userId },
            data: {
                emailEnabled: updates.enabled,
                emailFrequency: updates.frequency,
                emailTypes: updates.types
            }
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'EMAIL_NOTIFICATIONS_UPDATED',
                description: 'Updated email notification settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Email notification settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get push notifications
 * @route   GET /api/v1/account/notifications/push
 */
export const getPushNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.notificationSettings.findUnique({
        where: { userId },
        select: {
            pushEnabled: true,
            pushTypes: true,
            deviceTokens: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'Push notification settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update push notifications
 * @route   PUT /api/v1/account/notifications/push
 */
export const updatePushNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationSettings.update({
            where: { userId },
            data: {
                pushEnabled: updates.enabled,
                pushTypes: updates.types
            }
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'PUSH_NOTIFICATIONS_UPDATED',
                description: 'Updated push notification settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'Push notification settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get SMS notifications
 * @route   GET /api/v1/account/notifications/sms
 */
export const getSmsNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const settings = await prisma.notificationSettings.findUnique({
        where: { userId },
        select: {
            smsEnabled: true,
            smsTypes: true,
            phoneNumber: true
        }
    });

    if (!settings) {
        throw new ApiError(404, 'SMS notification settings not found');
    }

    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update SMS notifications
 * @route   PUT /api/v1/account/notifications/sms
 */
export const updateSmsNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await prisma.$transaction(async (tx) => {
        const updated = await tx.notificationSettings.update({
            where: { userId },
            data: {
                smsEnabled: updates.enabled,
                smsTypes: updates.types,
                phoneNumber: updates.phoneNumber
            }
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'SMS_NOTIFICATIONS_UPDATED',
                description: 'Updated SMS notification settings',
                metadata: { updates }
            }
        });

        return updated;
    });

    res.json({
        success: true,
        message: 'SMS notification settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Get notification history
 * @route   GET /api/v1/account/notifications/history
 */
export const getNotificationHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                type: true,
                title: true,
                message: true,
                isRead: true,
                createdAt: true
            }
        }),
        prisma.notification.count({
            where: { userId }
        })
    ]);

    res.json({
        success: true,
        data: {
            notifications,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        }
    });
});

/**
 * @desc    Send test notification
 * @route   POST /api/v1/account/notifications/test
 */
export const sendTestNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type = 'email' } = req.body;

    // Create test notification
    await prisma.notification.create({
        data: {
            userId,
            type,
            title: 'Test Notification',
            message: `This is a test ${type} notification`,
            metadata: {
                test: true,
                timestamp: new Date()
            }
        }
    });

    res.json({
        success: true,
        message: `Test ${type} notification sent successfully`
    });
});

/**
 * @desc    Clear notification history
 * @route   DELETE /api/v1/account/notifications/history
 */
export const clearNotificationHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.$transaction(async (tx) => {
        // Soft delete all notifications
        await tx.notification.updateMany({
            where: { userId },
            data: { deletedAt: new Date() }
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'NOTIFICATIONS_CLEARED',
                description: 'Cleared notification history'
            }
        });
    });

    res.json({
        success: true,
        message: 'Notification history cleared successfully'
    });
});

/**
 * @desc    Get single notification
 * @route   GET /api/v1/account/notifications/:id
 */
export const getNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    res.json({
        success: true,
        data: notification
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/account/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    await prisma.notification.update({
        where: { id },
        data: { 
            isRead: true,
            readAt: new Date()
        }
    });

    res.json({
        success: true,
        message: 'Notification marked as read'
    });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/account/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    await prisma.$transaction(async (tx) => {
        // Soft delete the notification
        await tx.notification.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'NOTIFICATION_DELETED',
                description: 'Deleted notification',
                metadata: { notificationId: id }
            }
        });
    });

    res.json({
        success: true,
        message: 'Notification deleted successfully'
    });
});

/**
 * @desc    Send real-time notification
 * @route   POST /api/v1/account/notifications/send
 */
export const sendNotification = asyncHandler(async (req, res) => {
    const { userId, type, title, message, priority = 'NORMAL' } = req.body;

    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            priority,
            timestamp: new Date()
        }
    });

    // Send real-time notification
    userWebSocketService.notifyUser(userId, {
        type: 'NEW_NOTIFICATION',
        data: notification
    });

    res.json({
        success: true,
        data: notification
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/account/notifications/:notificationId/read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await prisma.notification.update({
        where: {
            id: notificationId,
            userId
        },
        data: {
            read: true,
            readAt: new Date()
        }
    });

    // Update notification status in real-time
    userWebSocketService.notifyUser(userId, {
        type: 'NOTIFICATION_UPDATED',
        data: notification
    });

    res.json({
        success: true,
        data: notification
    });
}); 