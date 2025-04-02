import prisma from '../utils/database/prisma.js';
import NotificationService from './websocket/notification.service.js';

export class LoginService {
    static async updateLoginRecords(userId, loginData) {
        try {
            const [userUpdate, loginHistory, activityLog, userMetrics, analytics, session] = await prisma.$transaction([
                // Update user's basic login info
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        lastActive: new Date(),
                        failedLoginCount: 0,
                        isAccountLocked: false
                    }
                }),

                // Create login history
                prisma.loginHistory.create({
                    data: {
                        userId,
                        ipAddress: loginData.ipAddress || null,
                        userAgent: loginData.userAgent || null,
                        deviceType: loginData.deviceType || 'OTHER',
                        macAddress: loginData.macAddress || null,
                        metadata: {
                            browser: loginData.browser,
                            os: loginData.os,
                            platform: loginData.platform,
                            isMobile: loginData.isMobile
                        }
                    }
                }),

                // Create activity log
                prisma.userActivityLog.create({
                    data: {
                        userId,
                        activityType: 'LOGIN',
                        description: 'User logged in successfully',
                        ipAddress: loginData.ipAddress || null,
                        userAgent: loginData.userAgent || null,
                        metadata: {
                            deviceType: loginData.deviceType,
                            location: loginData.location,
                            loginMethod: loginData.loginMethod || 'standard'
                        }
                    }
                }),

                // Update user metrics
                prisma.userMetrics.upsert({
                    where: { userId },
                    create: {
                        userId,
                        totalSessionTime: 0,
                        averageSessionLength: 0,
                        lastNSessions: { sessions: [] },
                        dailyActivityStats: { loginCount: 1 }
                    },
                    update: {
                        totalSessionTime: { increment: 0 },
                        lastNSessions: { push: { timestamp: new Date() } }
                    }
                }),

                // Create analytics data
                prisma.analyticsData.create({
                    data: {
                        userId,
                        dataType: 'LOGIN_ACTIVITY',
                        data: {
                            timestamp: new Date(),
                            ipAddress: loginData.ipAddress,
                            deviceType: loginData.deviceType
                        }
                    }
                }),

                // Create user session
                prisma.userSession.create({
                    data: {
                        userId,
                        startTime: new Date(),
                        ipAddress: loginData.ipAddress,
                        isActive: true
                    }
                })
            ]);

            // Notify about login via WebSocket
            NotificationService.notifyLogin(userId, {
                deviceType: loginData.deviceType,
                location: loginData.location,
                timestamp: new Date()
            });

            return { userUpdate, loginHistory, activityLog, userMetrics, analytics, session };
        } catch (error) {
            console.error('Login records update failed:', error);
            // Don't throw error as this is background task
            return null;
        }
    }
}