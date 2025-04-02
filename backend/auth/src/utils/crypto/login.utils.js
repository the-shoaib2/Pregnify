import prisma from '../database/prisma.js';

export const updateLoginRecords = async (userId, loginData) => {
    try {
        // First, update user's basic login info
        await prisma.user.update({
            where: { id: userId },
            data: {
                lastActive: new Date(), // Using lastActive instead of lastLoginAt
                failedLoginCount: 0,
                isAccountLocked: false // Reset account lock if it was locked
            }
        });

        // Create login history entry
        await prisma.loginHistory.create({
            data: {
                userId,
                ipAddress: loginData.ipAddress || null,
                userAgent: loginData.userAgent || null,
                deviceType: loginData.deviceType || 'OTHER',
                macAddress: loginData.macAddress || null,
                deviceInfo: loginData.deviceInfo || null,
                location: loginData.location || null,
                loginAt: new Date(),
                successful: true,
                logoutAt: null,
                sessionDuration: null,
                failureReason: null,
                metadata: {
                    browser: loginData.browser,
                    os: loginData.os,
                    platform: loginData.platform,
                    isMobile: loginData.isMobile
                }
            }
        });

        // Create user activity log
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'LOGIN',
                description: 'User logged in successfully',
                ipAddress: loginData.ipAddress || null,
                userAgent: loginData.userAgent || null,
                timestamp: new Date(),
                metadata: {
                    deviceType: loginData.deviceType,
                    location: loginData.location,
                    browser: loginData.browser,
                    platform: loginData.platform,
                    loginMethod: loginData.loginMethod || 'standard'
                }
            }
        });

        // Create or update user metrics
        await prisma.userMetrics.upsert({
            where: { userId },
            create: {
                userId,
                totalSessionTime: 0,
                averageSessionLength: 0,
                lastNSessions: {
                    sessions: [{
                        timestamp: new Date(),
                        deviceType: loginData.deviceType,
                        duration: 0
                    }]
                },
                dailyActivityStats: {
                    lastLogin: new Date(),
                    loginCount: 1
                }
            },
            update: {
                lastNSessions: {
                    push: {
                        timestamp: new Date(),
                        deviceType: loginData.deviceType,
                        duration: 0
                    }
                }
            }
        });

        // Create analytics data
        await prisma.analyticsData.create({
            data: {
                userId,
                dataType: 'LOGIN_ACTIVITY',
                data: {
                    timestamp: new Date(),
                    ipAddress: loginData.ipAddress,
                    deviceType: loginData.deviceType,
                    location: loginData.location,
                    browser: loginData.browser,
                    platform: loginData.platform
                }
            }
        });

        // Create or update user session
        await prisma.userSession.create({
            data: {
                userId,
                startTime: new Date(),
                deviceInfo: loginData.deviceInfo || {},
                ipAddress: loginData.ipAddress,
                location: loginData.location || {},
                isActive: true
            }
        });

    } catch (error) {
        console.error('Failed to update login records:', error);
        // Log the specific error for debugging
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        // Don't throw error as this is not critical for login
    }
};

export const recordFailedLogin = async (userId, failureData) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                failedLoginCount: {
                    increment: 1
                },
                isAccountLocked: failureData.shouldLockAccount || false
            }
        });

        await prisma.loginHistory.create({
            data: {
                userId,
                ipAddress: failureData.ipAddress,
                userAgent: failureData.userAgent,
                deviceType: failureData.deviceType || 'OTHER',
                successful: false,
                failureReason: failureData.reason,
                metadata: {
                    attemptDetails: failureData.details,
                    timestamp: new Date()
                }
            }
        });

        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'FAILED_LOGIN',
                description: `Failed login attempt: ${failureData.reason}`,
                ipAddress: failureData.ipAddress,
                userAgent: failureData.userAgent,
                metadata: {
                    failureReason: failureData.reason,
                    attemptNumber: failureData.attemptNumber,
                    deviceType: failureData.deviceType
                }
            }
        });
    } catch (error) {
        console.error('Failed to record failed login:', error);
    }
}; 