import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { sendSecurityAlert } from '../../utils/email/email.utils.js';

/**
 * @desc    Get all user devices
 * @route   GET /api/v1/account/devices
 */
export const getDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const devices = await prisma.trustedDevice.findMany({
        where: {
            userId,
            isRevoked: false
        },
        select: {
            id: true,
            deviceId: true,
            deviceName: true,
            deviceType: true,
            lastUsed: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true
        },
        orderBy: {
            lastUsed: 'desc'
        }
    });

    res.json({
        success: true,
        data: devices
    });
});

/**
 * @desc    Trust a device
 * @route   POST /api/v1/account/devices/trust/:deviceId
 */
export const trustDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const { deviceName } = req.body;

    // Check if device is already trusted
    const existingDevice = await prisma.trustedDevice.findFirst({
        where: {
            userId,
            deviceId,
            isRevoked: false
        }
    });

    if (existingDevice) {
        throw new ApiError(400, 'Device is already trusted');
    }

    // Create trusted device record
    const device = await prisma.trustedDevice.create({
        data: {
            userId,
            deviceId,
            deviceName,
            deviceType: req.useragent?.platform || 'unknown',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            lastUsed: new Date()
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'DEVICE_TRUSTED',
            description: 'New device trusted',
            metadata: {
                deviceId: device.id,
                deviceName: device.deviceName
            }
        }
    });

    // Send security alert
    await sendSecurityAlert(req.user.email, {
        type: 'DEVICE_TRUSTED',
        deviceName: deviceName,
        location: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json({
        success: true,
        message: 'Device trusted successfully',
        data: device
    });
});

/**
 * @desc    Untrust a device
 * @route   DELETE /api/v1/account/devices/trust/:deviceId
 */
export const untrustDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { deviceId } = req.params;

    const device = await prisma.trustedDevice.findFirst({
        where: {
            userId,
            deviceId,
            isRevoked: false
        }
    });

    if (!device) {
        throw new ApiError(404, 'Trusted device not found');
    }

    // Revoke device trust
    await prisma.trustedDevice.update({
        where: { id: device.id },
        data: {
            isRevoked: true,
            revokedAt: new Date()
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'DEVICE_UNTRUSTED',
            description: 'Device trust revoked',
            metadata: {
                deviceId: device.id,
                deviceName: device.deviceName
            }
        }
    });

    // Send security alert
    await sendSecurityAlert(req.user.email, {
        type: 'DEVICE_UNTRUSTED',
        deviceName: device.deviceName,
        location: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json({
        success: true,
        message: 'Device untrusted successfully'
    });
});

/**
 * @desc    Remove a device
 * @route   DELETE /api/v1/account/devices/:deviceId
 */
export const removeDevice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { deviceId } = req.params;

    const device = await prisma.trustedDevice.findFirst({
        where: {
            userId,
            deviceId,
            isRevoked: false
        }
    });

    if (!device) {
        throw new ApiError(404, 'Device not found');
    }

    // Remove device
    await prisma.trustedDevice.delete({
        where: { id: device.id }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'DEVICE_REMOVED',
            description: 'Device removed',
            metadata: {
                deviceId: device.id,
                deviceName: device.deviceName
            }
        }
    });

    res.json({
        success: true,
        message: 'Device removed successfully'
    });
});

/**
 * @desc    Get device tokens
 * @route   GET /api/v1/account/devices/tokens
 */
export const getDeviceTokens = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const tokens = await prisma.deviceToken.findMany({
        where: { userId },
        select: {
            id: true,
            token: true,
            deviceType: true,
            lastUsedAt: true
        }
    });

    res.json({
        success: true,
        data: tokens
    });
});

/**
 * @desc    Add device token
 * @route   POST /api/v1/account/devices/tokens
 */
export const addDeviceToken = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { token, deviceType } = req.body;

    // Check for existing token
    const existingToken = await prisma.deviceToken.findFirst({
        where: {
            userId,
            token
        }
    });

    if (existingToken) {
        // Update last used time
        await prisma.deviceToken.update({
            where: { id: existingToken.id },
            data: { lastUsedAt: new Date() }
        });

        return res.json({
            success: true,
            message: 'Device token updated successfully',
            data: existingToken
        });
    }

    // Create new token
    const deviceToken = await prisma.deviceToken.create({
        data: {
            userId,
            token,
            deviceType,
            lastUsedAt: new Date()
        }
    });

    res.status(201).json({
        success: true,
        message: 'Device token added successfully',
        data: deviceToken
    });
});

/**
 * @desc    Remove device token
 * @route   DELETE /api/v1/account/devices/tokens/:tokenId
 */
export const removeDeviceToken = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { tokenId } = req.params;

    const token = await prisma.deviceToken.findFirst({
        where: {
            id: tokenId,
            userId
        }
    });

    if (!token) {
        throw new ApiError(404, 'Device token not found');
    }

    await prisma.deviceToken.delete({
        where: { id: tokenId }
    });

    res.json({
        success: true,
        message: 'Device token removed successfully'
    });
}); 