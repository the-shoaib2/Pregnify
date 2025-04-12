import { USER_DEFINITIONS } from '../../constants/roles.constants.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../constants/index.js';
import prisma from '../../utils/database/prisma.js';


//user Count based on role
const getUserCount = async () => {
    const count = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            _all: true
        }
    });
    
    
    const allCount = count.reduce((acc, item) => acc + item._count._all, 0);
    
    // Find counts by role using the actual database values
    const superAdminCount = count.find(item => item.role === 'SUPER_ADMIN')?._count._all || 0;
    const adminCount = count.find(item => item.role === 'ADMIN')?._count._all || 0;
    const doctorCount = count.find(item => item.role === 'DOCTOR')?._count._all || 0;
    const patientCount = count.find(item => item.role === 'PATIENT')?._count._all || 0;
    const guestCount = count.find(item => item.role === 'GUEST')?._count._all || 0;

    return {
        total: allCount,
        byRole: {
            superAdmin: superAdminCount,
            admin: adminCount,
            doctor: doctorCount,
            patient: patientCount,
            guest: guestCount
        }
    };
};


// Helper function to get date ranges
const getDateRanges = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    return { today, thirtyDaysAgo, sixMonthsAgo };
};

// Format data for charts
const formatChartData = (data, labelField = 'date', valueField = 'count') => {
    return {
        labels: data.map(item => item[labelField]),
        data: data.map(item => item[valueField])
    };
};

// Get user distribution data
const getUserDistribution = async () => {
    const distribution = await prisma.user.groupBy({
        by: ['role'],
        _count: true
    });

    return {
        labels: distribution.map(item => item.role),
        data: distribution.map(item => item._count)
    };
};

// Get active users today data
const getActiveUsersToday = async (today) => {
    const activeUsers = await prisma.userActivityLog.groupBy({
        by: ['timestamp'],
        where: {
            timestamp: {
                gte: new Date(today.setHours(0, 0, 0, 0))
            }
        },
        _count: true
    });

    return formatChartData(activeUsers, 'timestamp', '_count');
};

// Get AI risk alerts count
const getAIRiskAlerts = async (thirtyDaysAgo) => {
    const alerts = await prisma.userActivityLog.groupBy({
        by: ['timestamp'],
        where: {
            activityType: 'SECURITY_ALERT',
            timestamp: { gte: thirtyDaysAgo }
        },
        _count: true
    });

    return formatChartData(alerts, 'timestamp', '_count');
};

// Get latest activities
const getLatestActivities = async () => {
    return await prisma.userActivityLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
            user: {
                select: {
                    username: true,
                    email: true,
                    role: true
                }
            }
        }
    });
};

// Get revenue vs app usage data
const getRevenueVsAppUsage = async (thirtyDaysAgo) => {
    const [revenue, appUsage] = await Promise.all([
        prisma.payment.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        }),
        prisma.userActivityLog.groupBy({
            by: ['timestamp'],
            where: {
                timestamp: { gte: thirtyDaysAgo }
            },
            _count: true
        })
    ]);

    return {
        revenue: formatChartData(revenue, 'createdAt', '_sum.amount'),
        appUsage: formatChartData(appUsage, 'timestamp', '_count')
    };
};

// Get user growth data
const getUserGrowth = async (sixMonthsAgo) => {
    const growth = await prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sixMonthsAgo } },
        _count: true
    });

    return formatChartData(growth, 'createdAt', '_count');
};

// Get health risk trend
const getHealthRiskTrend = async (thirtyDaysAgo) => {
    const risks = await prisma.riskAssessment.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _avg: { riskScore: true }
    });

    return formatChartData(risks, 'createdAt', '_avg.riskScore');
};

// Get doctor engagement data
const getDoctorEngagement = async (thirtyDaysAgo) => {
    const doctors = await prisma.doctorProfile.findMany({
        where: {
            user: {
                role: USER_DEFINITIONS.GAMMA
            }
        },
        select: {
            userId: true,
            user: {
                select: {
                    username: true,
                    email: true
                }
            },
            rating: true,
            totalReviews: true,
            _count: {
                select: {
                    appointments: true
                }
            }
        },
        orderBy: {
            rating: 'desc'
        },
        take: 5
    });

    return {
        labels: doctors.map(doctor => doctor.user.username),
        data: doctors.map(doctor => doctor._count.appointments)
    };
};

// Get revenue data
const getRevenueData = async (thirtyDaysAgo) => {
    const revenue = await prisma.payment.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: 'COMPLETED'
        },
        _sum: { amount: true }
    });

    return formatChartData(revenue, 'createdAt', '_sum.amount');
};

// Get device usage data
const getDeviceUsage = async (thirtyDaysAgo) => {
    const usage = await prisma.userActivityLog.groupBy({
        by: ['activityType'],
        where: {
            timestamp: { gte: thirtyDaysAgo }
        },
        _count: true
    });

    return {
        labels: usage.map(item => item.activityType),
        data: usage.map(item => item._count)
    };
};

/**
 * @desc    Get dashboard overview data
 * @route   GET /api/v1/admin/dashboard
 * @access  Admin
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
    const { today, thirtyDaysAgo, sixMonthsAgo } = getDateRanges();

    // Gather all data in parallel
    const [
        userCount,
        userDistribution,
        activeUsersToday,
        aiRiskAlerts,
        latestActivity,
        revenueVsAppUsage,
        userGrowth,
        healthRiskTrend,
        doctorEngagement,
        revenue,
        deviceUsage
    ] = await Promise.all([
        getUserCount(),
        getUserDistribution(),
        getActiveUsersToday(today),
        getAIRiskAlerts(thirtyDaysAgo),
        getLatestActivities(),
        getRevenueVsAppUsage(thirtyDaysAgo),
        getUserGrowth(sixMonthsAgo),
        getHealthRiskTrend(thirtyDaysAgo),
        getDoctorEngagement(thirtyDaysAgo),
        getRevenueData(thirtyDaysAgo),
        getDeviceUsage(thirtyDaysAgo)
    ]);

    // Compile dashboard data
    const dashboardData = {
        overview: {
            userCount,
            userDistribution,
            activeUsersToday,
            aiRiskAlertsCount: aiRiskAlerts,
            latestActivity,
            revenueVsAppUsage
        },
        analytics: {
            userGrowth,
            healthRiskTrend,
            doctorEngagement,
            revenue,
            deviceUsage
        }
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboardData,
        metadata: {
            lastUpdated: new Date().toISOString(),
            dataRange: {
                start: thirtyDaysAgo.toISOString(),
                end: new Date().toISOString()
            }
        }
    });
});