import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';
import ApiResponse from '../../../utils/error/api.response.js';
import  asyncHandler  from '../../../utils/middleware/async.handler.js';
import { USER_DEFINITIONS } from '../../../constants/roles.constants.js';

export const dashboardController = {
    getDashboardData: asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            // Get user details
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    pregnancyProfile: true,
                    doctorProfile: true,
                    medicalAppointments: true,
                    riskAssessments: true,
                    healthMetrics: true,
                    healthAlerts: true
                }
            });

            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            let dashboardData = {};

            // Role-based dashboard data
            switch (userRole) {
                case USER_DEFINITIONS.GAMMA: // DOCTOR
                    dashboardData = await getDoctorDashboard(user);
                    break;

                case USER_DEFINITIONS.DELTA: // PATIENT
                    dashboardData = await getPatientDashboard(user);
                    break;

                case USER_DEFINITIONS.EPSILON: // GUEST
                    dashboardData = await getGuestDashboard(user);
                    break;

                default:
                    throw new ApiError(403, 'Invalid user role');
            }

            return new ApiResponse(res, 200, 'Dashboard data fetched successfully', dashboardData);
        } catch (error) {
            return new ApiResponse(res, error.statusCode || 500, error.message || 'Error fetching dashboard data');
        }
    })
};

// Doctor Dashboard Data
async function getDoctorDashboard(user) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    const [appointments, patients, reviews] = await Promise.all([
        // Get upcoming appointments
        prisma.doctorAppointment.findMany({
            where: {
                doctorId: user.doctorProfile?.id,
                appointmentDate: { gte: new Date() },
                status: 'SCHEDULED'
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true
                    }
                }
            },
            orderBy: { appointmentDate: 'asc' },
            take: 5
        }),

        // Get recent patients
        prisma.user.findMany({
            where: {
                medicalAppointments: {
                    some: {
                        doctorId: user.doctorProfile?.id
                    }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                pregnancyProfile: true
            },
            take: 5
        }),

        // Get recent reviews
        prisma.doctorReview.findMany({
            where: {
                doctorId: user.doctorProfile?.id
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    return {
        profile: {
            name: `${user.firstName} ${user.lastName}`,
            speciality: user.doctorProfile?.speciality,
            rating: user.doctorProfile?.rating,
            totalReviews: user.doctorProfile?.totalReviews
        },
        appointments: {
            upcoming: appointments,
            total: appointments.length
        },
        patients: {
            recent: patients,
            total: patients.length
        },
        reviews: {
            recent: reviews,
            total: reviews.length
        }
    };
}

// Patient Dashboard Data
async function getPatientDashboard(user) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    const [appointments, healthMetrics, riskAssessments, healthAlerts] = await Promise.all([
        // Get upcoming appointments
        prisma.medicalAppointment.findMany({
            where: {
                userId: user.id,
                date: { gte: new Date() }
            },
            include: {
                doctor: {
                    select: {
                        name: true,
                        speciality: true
                    }
                }
            },
            orderBy: { date: 'asc' },
            take: 5
        }),

        // Get recent health metrics
        prisma.healthMetric.findMany({
            where: {
                userId: user.id,
                measuredAt: { gte: thirtyDaysAgo }
            },
            orderBy: { measuredAt: 'desc' },
            take: 10
        }),

        // Get recent risk assessments
        prisma.riskAssessment.findMany({
            where: {
                userId: user.id
            },
            orderBy: { assessmentDate: 'desc' },
            take: 3
        }),

        // Get recent health alerts
        prisma.healthAlert.findMany({
            where: {
                userId: user.id,
                isRead: false
            },
            orderBy: { triggeredAt: 'desc' },
            take: 5
        })
    ]);

    return {
        profile: {
            name: `${user.firstName} ${user.lastName}`,
            pregnancyWeek: user.pregnancyProfile?.pregnancyWeek,
            dueDate: user.pregnancyProfile?.dueDate
        },
        appointments: {
            upcoming: appointments,
            total: appointments.length
        },
        health: {
            metrics: healthMetrics,
            riskAssessments: riskAssessments,
            alerts: healthAlerts
        }
    };
}

// Guest Dashboard Data
async function getGuestDashboard(user) {
    return {
        profile: {
            name: `${user.firstName} ${user.lastName}`,
            role: 'GUEST'
        },
        features: {
            canView: ['Public Information', 'Basic Health Tips'],
            cannotView: ['Medical Records', 'Appointments', 'Personal Health Data']
        }
    };
}


