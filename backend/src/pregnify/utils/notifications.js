import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Send a notification to a user
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - ID of the user to notify
 * @param {string} notificationData.title - Title of the notification
 * @param {string} notificationData.message - Content of the notification
 * @param {string} [notificationData.type='SYSTEM'] - Type of notification
 * @param {Object} [notificationData.data={}] - Additional data for the notification
 * @returns {Promise<Object>} - Created notification
 */
export const sendNotification = async (notificationData) => {
  try {
    const { userId, title, message, type = 'SYSTEM', data = {} } = notificationData;

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data,
        read: false,
        createdAt: new Date()
      }
    });

    // Here you would implement push notification sending logic
    // This could be using Firebase Cloud Messaging, OneSignal, or another service
    // For now, this is just a placeholder
    console.log(`Push notification sent to user ${userId}: ${title}`);

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw error to prevent breaking the main flow
    return null;
  }
};

/**
 * Mark notifications as read
 * @param {string} userId - ID of the user
 * @param {Array<string>} [notificationIds] - Optional IDs of specific notifications to mark as read
 * @returns {Promise<number>} - Number of notifications marked as read
 */
export const markNotificationsAsRead = async (userId, notificationIds = null) => {
  try {
    const where = {
      userId,
      read: false,
      ...(notificationIds ? { id: { in: notificationIds } } : {})
    };

    const result = await prisma.notification.updateMany({
      where,
      data: {
        read: true,
        updatedAt: new Date()
      }
    });

    return result.count;
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return 0;
  }
};

/**
 * Delete notifications
 * @param {string} userId - ID of the user
 * @param {Array<string>} notificationIds - IDs of notifications to delete
 * @returns {Promise<number>} - Number of notifications deleted
 */
export const deleteNotifications = async (userId, notificationIds) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        id: { in: notificationIds }
      }
    });

    return result.count;
  } catch (error) {
    console.error('Failed to delete notifications:', error);
    return 0;
  }
}; 