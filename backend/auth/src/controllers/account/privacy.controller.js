import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';

export const getPrivacySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const privacy = await prisma.accountPreferences.findUnique({
        where: { userId },
        select: {
            privacySettings: true,
            contentFilters: true,
            adPersonalization: true,
            securityQuestions: true,
            isEmailEnabled: true,
            isSmsEnabled: true,
            contentLanguage: true
        }
    });

    if (!privacy) {
        throw new ApiError(404, 'Privacy settings not found');
    }

    res.json({
        success: true,
        data: privacy
    });
});

export const updatePrivacySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        privacySettings,
        contentFilters,
        adPersonalization,
        isEmailEnabled,
        isSmsEnabled
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
        // Update privacy settings
        const preferences = await tx.accountPreferences.upsert({
            where: { userId },
            create: {
                userId,
                privacySettings,
                contentFilters,
                adPersonalization,
                isEmailEnabled,
                isSmsEnabled
            },
            update: {
                privacySettings,
                contentFilters,
                adPersonalization,
                isEmailEnabled,
                isSmsEnabled
            }
        });

        // Log the privacy settings update
        await tx.userActivityLog.create({
            data: {
                userId,
                activityType: 'PRIVACY_SETTINGS_UPDATE',
                description: 'Privacy settings updated',
                metadata: { updates: req.body }
            }
        });

        return preferences;
    });

    res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: updated
    });
});

export const getPersonalData = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            personalInformation: true,
            medicalInformation: true,
            educationQualification: true,
            preferences: true,
            loginHistory: {
                take: 10,
                orderBy: { loginAt: 'desc' }
            },
            userActivities: {
                take: 20,
                orderBy: { timestamp: 'desc' }
            }
        }
    });

    if (!userData) {
        throw new ApiError(404, 'User data not found');
    }

    res.json({
        success: true,
        data: userData
    });
});

export const exportPersonalData = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get all user data
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            personalInformation: true,
            medicalInformation: true,
            educationQualification: true,
            preferences: true,
            loginHistory: true,
            userActivities: true,
            userSessions: true,
            analyticsData: true
        }
    });

    if (!userData) {
        throw new ApiError(404, 'User data not found');
    }

    // Log the export activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'DATA_EXPORT',
            description: 'Personal data exported'
        }
    });

    // Format data for export
    const exportData = {
        personalInfo: {
            email: userData.email,
            username: userData.username,
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phoneNumber
        },
        profile: userData.personalInformation,
        medical: userData.medicalInformation,
        education: userData.educationQualification,
        preferences: userData.preferences,
        activity: {
            loginHistory: userData.loginHistory,
            sessions: userData.userSessions,
            activities: userData.userActivities
        }
    };

    res.json({
        success: true,
        message: 'Data export successful',
        data: exportData
    });
});

export const deletePersonalData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password before deletion
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password_hash: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new ApiError(401, 'Invalid password');
    }

    // Perform cascading deletion
    await prisma.$transaction([
        prisma.personalInformation.deleteMany({ where: { userId } }),
        prisma.medicalInformation.deleteMany({ where: { userId } }),
        prisma.educationQualification.deleteMany({ where: { userId } }),
        prisma.accountPreferences.deleteMany({ where: { userId } }),
        prisma.userSession.deleteMany({ where: { userId } }),
        prisma.userActivityLog.deleteMany({ where: { userId } }),
        prisma.analyticsData.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
    });
});

export const getConsents = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const consents = await prisma.userConsent.findMany({
        where: { userId },
        select: {
            id: true,
            type: true,
            status: true,
            givenAt: true,
            expiresAt: true,
            lastUpdated: true,
            description: true
        }
    });

    res.json({
        success: true,
        data: consents
    });
});

export const updateConsents = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { consents } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
        const updatedConsents = await Promise.all(
            consents.map(async (consent) => {
                const { type, status } = consent;

                const updated = await tx.userConsent.upsert({
                    where: {
                        userId_type: {
                            userId,
                            type
                        }
                    },
                    create: {
                        userId,
                        type,
                        status,
                        givenAt: status ? new Date() : null,
                        lastUpdated: new Date()
                    },
                    update: {
                        status,
                        givenAt: status ? new Date() : null,
                        lastUpdated: new Date()
                    }
                });

                // Log consent change
                await tx.userActivityLog.create({
                    data: {
                        userId,
                        activityType: 'CONSENT_UPDATE',
                        description: `Consent ${type} ${status ? 'given' : 'withdrawn'}`,
                        metadata: { consentType: type, status }
                    }
                });

                return updated;
            })
        );

        // Update user's privacy settings based on consents
        await tx.accountPreferences.update({
            where: { userId },
            data: {
                privacySettings: {
                    dataCollection: consents.some(c => c.type === 'DATA_COLLECTION' && c.status),
                    marketing: consents.some(c => c.type === 'MARKETING' && c.status),
                    thirdParty: consents.some(c => c.type === 'THIRD_PARTY' && c.status)
                }
            }
        });

        return updatedConsents;
    });

    res.json({
        success: true,
        message: 'Consents updated successfully',
        data: updated
    });
});

// Helper function to validate consent expiry
const validateConsentExpiry = (consent) => {
    if (!consent.expiresAt) return true;
    return new Date() < new Date(consent.expiresAt);
};

// Helper function to check required consents
export const checkRequiredConsents = asyncHandler(async (userId) => {
    const requiredConsents = ['DATA_COLLECTION', 'TERMS_OF_SERVICE'];
    
    const userConsents = await prisma.userConsent.findMany({
        where: {
            userId,
            type: { in: requiredConsents }
        }
    });

    const missingConsents = requiredConsents.filter(required => 
        !userConsents.some(consent => 
            consent.type === required && 
            consent.status && 
            validateConsentExpiry(consent)
        )
    );

    if (missingConsents.length > 0) {
        throw new ApiError(403, 'Required consents missing', {
            missingConsents
        });
    }

    return true;
}); 