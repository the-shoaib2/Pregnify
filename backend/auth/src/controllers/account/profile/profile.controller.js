import prisma from '../../../utils/database/prisma.js';
import ApiError from '../../../utils/error/api.error.js';
import asyncHandler from '../../../utils/middleware/async.handler.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import { HTTP_STATUS } from '../../../constants/index.js';
import { serializeBigInt } from '../../../utils/serializers/data.serializer.js';

/**
 * @desc    Get complete user profile
 * @route   GET /api/v1/account/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const profile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            // Basic Info
            id: true,
            userID: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            description: true,
            avatar: true,
            avatarThumb: true,
            cover: true,
            coverThumb: true,
            bio: true,
            location: true,

            // Account Status
            isVerified: true,
            accountStatus: true,
            activeStatus: true,
            lastActive: true,
            lastLoginAt: true,

            // Personal Information
            personalInformation: {
                select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    nickName: true,
                    genderIdentity: true,
                    dateOfBirth: true,
                    age: true,
                    isDeceased: true,
                    description: true,

                    // Birth details
                    placeOfBirth: true,
                    countryOfBirth: true,
                    nationality: true,
                    passportNumber: true,
                    passportExpiry: true,
                    maritalStatus: true,
                    citizenship: true,
                    occupation: true,
                    religion: true,
                    hobbies: true,
                    additionalInfo: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,

                    // Contact Information
                    contactNumbers: {
                        select: {
                            id: true,
                            number: true,
                            isPrimary: true,
                            isVerified: true
                        }
                    },

                    // Addresses
                    addresses: {
                        select: {
                            id: true,
                            type: true,
                            details: true
                        }
                    },

                    // Websites
                    websites: {
                        select: {
                            id: true,
                            category: true,
                            name: true,
                            url: true,
                            username: true
                        }
                    },

                    // Emergency Contacts
                    emergencyContact: {
                        select: {
                            id: true,
                            name: true,
                            relation: true,
                            phone: true,
                            createdAt: true,
                            updatedAt: true,
                            deletedAt: true
                        }
                    }
                }
            },

            // Education
            educationQualification: {
                select: {
                    id: true,
                    degree: true,
                    fieldOfStudy: true,
                    qualification: true,
                    institution: true,
                    startYear: true,
                    endYear: true,
                    isOngoing: true,
                    gpa: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    startYear: 'desc'
                }
            },

            // Medical Information
            medicalInformation: {
                select: {
                    id: true,
                    userId: true,
                    bloodGroup: true,
                    organDonor: true,
                    medicalHistory: true,
                    chronicDiseases: true,
                    cancerHistory: true,
                    cancerType: true,
                    allergies: true,
                    medications: true,
                    medicalReports: {
                        select: {
                            id: true,
                            reportType: true,
                            reportDate: true,
                            reportDetails: true,
                            doctorId: true,
                            fileId: true,
                            file: true,
                            createdAt: true,
                            updatedAt: true
                        },
                        orderBy: {
                            reportDate: 'desc'
                        }
                    },
                    prescriptions: {
                        select: {
                            id: true,
                            medicationName: true,
                            dosage: true,
                            frequency: true,
                            startDate: true,
                            endDate: true,
                            doctorId: true,
                            pharmacy: true,
                            notes: true,
                            isActive: true,
                            fileId: true,
                            file: true,
                            refillCount: true,
                            refillDate: true,
                            createdAt: true,
                            updatedAt: true
                        },
                        orderBy: {
                            startDate: 'desc'
                        }
                    },
                    vaccinationRecords: true,
                    geneticDisorders: true,
                    disabilities: true,
                    emergencyContact: true,
                    primaryPhysician: true,
                    createdAt: true,
                    updatedAt: true
                }
            },

            //Files
            files: {
                where: {
                    deletedAt: null
                },
                select: {
                    id: true,
                    userId: true,
                    fileType: true,
                    fileCategory: true,
                    url: true,
                    title: true,
                    description: true,
                    visibility: true,
                    size: true,
                    format: true,
                    width: true,
                    height: true,
                    duration: true,
                    cloudinaryId: true,
                    cloudinaryData: true,
                    allowComments: true,
                    allowSharing: true,
                    allowDownload: true,
                    customAudience: true,
                    privacySettings: true,
                    metadata: true,
                    viewCount: true,
                    reactionCount: true,
                    shareCount: true,
                    commentCount: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    },
                    tags: true,
                    albums: true,
                    collections: true,
                    comments: true,
                    reactions: true,
                    shares: true,
                    fileHistory: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    editedAt: true
                }
            },

            // Stats & Metrics
            profileCompletionPercentage: true,
            postCount: true,
            commentCount: true,
            reactionCount: true,
            shareCount: true,
            engagementScore: true,
            reputationScore: true,

            // Social Connections
            followers: {
                select: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    createdAt: true
                }
            },
            following: {
                select: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    createdAt: true
                }
            },

            // Activity & Engagement
            activityLogs: {
                take: 5,
                orderBy: {
                    timestamp: 'desc'
                },
                select: {
                    id: true,
                    activityType: true,
                    description: true,
                    timestamp: true,
                    metadata: true
                }
            },

            // Timestamps
            createdAt: true,
            updatedAt: true
        }
    });

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Profile not found');
    }

    // Calculate profile completion
    const completionScore = calculateProfileCompletion(profile);

    // Format and serialize the response
    const formattedProfile = {
        basicInfo: {
            id: profile.id,
            userID: profile.userID,
            username: profile.username,
            email: profile.email,
            name: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
            },
            avatar: profile.avatar,
            avatarThumb: profile.avatarThumb,
            cover: profile.cover,
            coverThumb: profile.coverThumb,
            bio: profile.bio,
            location: profile.location,
            description: profile.description
        },

        accountStatus: {
            isVerified: profile.isVerified,
            status: profile.accountStatus,
            activeStatus: profile.activeStatus,
            lastActive: profile.lastActive,
            lastLogin: profile.lastLoginAt
        },

        // Personal information properly formatted
        personal: profile.personalInformation?.length > 0 ? {
            id: profile.personalInformation[0]?.id,
            name: {
                firstName: profile.personalInformation[0]?.firstName,
                middleName: profile.personalInformation[0]?.middleName,
                lastName: profile.personalInformation[0]?.lastName,
                nickName: profile.personalInformation[0]?.nickName
            },
            identity: {
                gender: profile.personalInformation[0]?.genderIdentity,
                dateOfBirth: profile.personalInformation[0]?.dateOfBirth,
                age: profile.personalInformation[0]?.dateOfBirth
                    ? calculateAge(profile.personalInformation[0].dateOfBirth)
                    : null,
                isDeceased: profile.personalInformation[0]?.isDeceased
            },
            origin: {
                placeOfBirth: profile.personalInformation[0]?.placeOfBirth,
                countryOfBirth: profile.personalInformation[0]?.countryOfBirth,
                nationality: profile.personalInformation[0]?.nationality
            },
            contact: {
                phone: profile.personalInformation[0]?.contactNumbers
            },
            addresses: profile.personalInformation[0]?.addresses || [],
            identification: {
                passport: {
                    number: profile.personalInformation[0]?.passportNumber,
                    expiry: profile.personalInformation[0]?.passportExpiry
                },
                citizenship: profile.personalInformation[0]?.citizenship,
                maritalStatus: profile.personalInformation[0]?.maritalStatus
            },
            occupation: profile.personalInformation[0]?.occupation,
            religion: profile.personalInformation[0]?.religion,
            hobbies: profile.personalInformation[0]?.hobbies,
            additionalInfo: profile.personalInformation[0]?.additionalInfo,
            websites: profile.personalInformation[0]?.websites || [],
            emergencyContacts: profile.personalInformation[0]?.emergencyContact || [],
            description: profile.personalInformation[0]?.description,
            timestamps: {
                created: profile.personalInformation[0]?.createdAt,
                updated: profile.personalInformation[0]?.updatedAt
            }
        } : null,

        // Education properly formatted as array
        education: profile.educationQualification?.map(edu => ({
            id: edu.id,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            qualification: edu.qualification,
            institution: edu.institution,
            startYear: edu.startYear,
            endYear: edu.endYear,
            isOngoing: edu.isOngoing,
            gpa: edu.gpa,
            timestamps: {
                created: edu.createdAt,
                updated: edu.updatedAt
            }
        })) || [],

        // Medical information properly formatted
        medical: profile.medicalInformation?.length > 0 ? {
            id: profile.medicalInformation[0]?.id,
            bloodGroup: profile.medicalInformation[0]?.bloodGroup,
            organDonor: profile.medicalInformation[0]?.organDonor,
            medicalHistory: profile.medicalInformation[0]?.medicalHistory,
            chronicDiseases: profile.medicalInformation[0]?.chronicDiseases,
            cancerHistory: profile.medicalInformation[0]?.cancerHistory,
            cancerType: profile.medicalInformation[0]?.cancerType,
            allergies: profile.medicalInformation[0]?.allergies,
            medications: profile.medicalInformation[0]?.medications,
            vaccinationRecords: profile.medicalInformation[0]?.vaccinationRecords,
            geneticDisorders: profile.medicalInformation[0]?.geneticDisorders,
            disabilities: profile.medicalInformation[0]?.disabilities,
            emergencyContact: profile.medicalInformation[0]?.emergencyContact,
            primaryPhysician: profile.medicalInformation[0]?.primaryPhysician,
            history: {
                general: profile.medicalInformation[0]?.medicalHistory,
                chronicConditions: profile.medicalInformation[0]?.chronicDiseases,
                cancer: {
                    history: profile.medicalInformation[0]?.cancerHistory,
                    type: profile.medicalInformation[0]?.cancerType
                }
            },
            currentCare: {
                allergies: profile.medicalInformation[0]?.allergies,
                medications: profile.medicalInformation[0]?.medications
            },
            reports: profile.medicalInformation[0]?.medicalReports?.map(report => ({
                id: report.id,
                type: report.reportType,
                date: report.reportDate,
                details: report.reportDetails,
                doctor: report.doctorId,
                file: report.file ? {
                    id: report.file.id,
                    url: report.file.url,
                    type: report.file.fileType,
                    size: report.file.size,
                    format: report.file.format
                } : null,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            })) || [],
            prescriptions: profile.medicalInformation[0]?.prescriptions?.map(prescription => ({
                id: prescription.id,
                medication: prescription.medicationName,
                dosage: prescription.dosage,
                schedule: prescription.frequency,
                period: {
                    start: prescription.startDate,
                    end: prescription.endDate
                },
                doctor: prescription.doctorId,
                pharmacy: prescription.pharmacy,
                notes: prescription.notes,
                isActive: prescription.isActive,
                fileId: prescription.fileId,
                file: prescription.file ? {
                    id: prescription.file.id,
                    url: prescription.file.url,
                    type: prescription.file.fileType,
                    size: prescription.file.size,
                    format: prescription.file.format
                } : null,
                refillInfo: {
                    count: prescription.refillCount,
                    date: prescription.refillDate
                },
                timestamps: {
                    created: prescription.createdAt,
                    updated: prescription.updatedAt
                }
            })) || [],
            timestamps: {
                created: profile.medicalInformation[0]?.createdAt,
                updated: profile.medicalInformation[0]?.updatedAt
            }
        } : null,

        // Files properly formatted
        files: profile.files?.map(file => ({
            id: file.id,
            type: file.fileType,
            category: file.fileCategory,
            url: file.url,
            title: file.title,
            description: file.description,
            visibility: file.visibility,
            size: file.size,
            format: file.format,
            dimensions: file.width && file.height ? {
                width: file.width,
                height: file.height
            } : null,
            duration: file.duration,
            stats: {
                views: file.viewCount,
                reactions: file.reactionCount,
                shares: file.shareCount,
                comments: file.commentCount
            },
            timestamps: {
                created: file.createdAt,
                updated: file.updatedAt,
                edited: file.editedAt,
                deleted: file.deletedAt
            }
        })) || [],

        // Stats properly formatted
        stats: {
            posts: profile.postCount,
            comments: profile.commentCount,
            likes: profile.reactionCount,
            shares: profile.shareCount,
            engagement: profile.engagementScore,
            reputation: profile.reputationScore,
            completion: {
                score: completionScore,
                details: profile.completionDetails,
                suggestions: getProfileCompletionSuggestions(profile)
            }
        },

        // Social connections properly formatted
        social: {
            followersCount: profile.followers.length,
            followingCount: profile.following.length,
            followers: profile.followers.map(f => ({
                id: f.follower.id,
                username: f.follower.username,
                avatar: f.follower.avatar,
                name: {
                    firstName: f.follower.firstName,
                    lastName: f.follower.lastName
                },
                followedAt: f.createdAt
            })),
            following: profile.following.map(f => ({
                id: f.following.id,
                username: f.following.username,
                avatar: f.following.avatar,
                name: {
                    firstName: f.following.firstName,
                    lastName: f.following.lastName
                },
                followedAt: f.createdAt
            }))
        },

        // Activity logs properly formatted
        activity: {
            recent: profile.activityLogs.map(log => ({
                id: log.id,
                type: log.activityType,
                description: log.description,
                timestamp: log.timestamp,
                metadata: log.metadata
            })),
            lastActive: profile.lastActive,
            lastLogin: profile.lastLoginAt
        },

        // Timestamps
        timestamps: {
            created: profile.createdAt,
            updated: profile.updatedAt
        }
    };

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: serializeBigInt(formattedProfile)
    });
});

/**
 * Calculate profile completion percentage
 * @param {Object} profile - User profile data
 * @returns {number} - Completion percentage
 */
const calculateProfileCompletion = (profile) => {
    const sections = {
        basicInfo: {
            fields: [
                { name: 'username', value: profile.username, weight: 4 },
                { name: 'email', value: profile.email, weight: 4 },
                { name: 'firstName', value: profile.firstName, weight: 3 },
                { name: 'lastName', value: profile.lastName, weight: 3 },
                { name: 'description', value: profile.description, weight: 3 },
                { name: 'avatar', value: profile.avatar, weight: 5 },
                { name: 'cover', value: profile.cover, weight: 3 },
                { name: 'bio', value: profile.bio, weight: 3 },
                { name: 'location', value: profile.location, weight: 2 }
            ],
            sectionWeight: 30
        },
        personalInfo: {
            fields: [
                { name: 'dateOfBirth', value: profile.personalInformation?.dateOfBirth, weight: 4 },
                { name: 'gender', value: profile.personalInformation?.genderIdentity, weight: 3 },
                { name: 'phone', value: profile.personalInformation?.contactNumbers, weight: 4 },
                { name: 'currentAddress', value: profile.personalInformation[0]?.addresses.find(addr => addr.type === 'CURRENT')?.details, weight: 4 },
                { name: 'permanentAddress', value: profile.personalInformation[0]?.addresses.find(addr => addr.type === 'PERMANENT')?.details, weight: 3 },
                { name: 'birthPlace', value: profile.personalInformation[0]?.placeOfBirth, weight: 3 },
                { name: 'birthCountry', value: profile.personalInformation[0]?.countryOfBirth, weight: 3 },
                { name: 'citizenship', value: profile.personalInformation[0]?.citizenship, weight: 4 },
                { name: 'religion', value: profile.personalInformation[0]?.religion, weight: 2 },
                { name: 'maritalStatus', value: profile.personalInformation[0]?.maritalStatus, weight: 3 },
                { name: 'hobbies', value: profile.personalInformation[0]?.hobbies, weight: 2 },
                { name: 'emergencyContact', value: profile.personalInformation[0]?.emergencyContact?.length > 0, weight: 6 }
            ],
            sectionWeight: 40
        },
        education: {
            fields: [
                {
                    name: 'qualifications',
                    value: profile.educationQualification?.length > 0,
                    weight: 15,
                    bonus: profile.educationQualification?.length > 1 ? 5 : 0 // Bonus for multiple entries
                }
            ],
            sectionWeight: 15
        },
        verification: {
            fields: [
                { name: 'accountVerified', value: profile.isVerified, weight: 8 },
                { name: 'activeAccount', value: profile.accountStatus === 'ACTIVE', weight: 7 }
            ],
            sectionWeight: 15
        }
    };

    // Calculate section scores with weighted fields
    const sectionScores = Object.entries(sections).map(([sectionName, section]) => {
        const totalSectionWeight = section.fields.reduce((sum, field) => sum + field.weight, 0);

        const completedWeight = section.fields.reduce((sum, field) => {
            const isCompleted = Array.isArray(field.value)
                ? field.value.length > 0
                : field.value !== null && field.value !== undefined && field.value !== '';

            const fieldScore = isCompleted ? field.weight : 0;
            const bonusScore = isCompleted && field.bonus ? field.bonus : 0;

            return sum + fieldScore + bonusScore;
        }, 0);

        const sectionPercentage = (completedWeight / totalSectionWeight) * 100;
        const weightedScore = (sectionPercentage * section.sectionWeight) / 100;

        return {
            section: sectionName,
            percentage: Math.round(sectionPercentage),
            weightedScore: Math.round(weightedScore),
            completedFields: section.fields.filter(field =>
                Array.isArray(field.value)
                    ? field.value.length > 0
                    : field.value !== null && field.value !== undefined && field.value !== ''
            ).length,
            totalFields: section.fields.length
        };
    });

    // Calculate total weighted score
    const totalScore = Math.min(
        100,
        Math.round(sectionScores.reduce((sum, section) => sum + section.weightedScore, 0))
    );

    // Add completion details to profile metadata
    profile.completionDetails = {
        score: totalScore,
        sections: sectionScores,
        lastUpdated: new Date()
    };

    return totalScore;
};

/**
 * Get profile completion suggestions
 */
const getProfileCompletionSuggestions = (profile) => {
    const suggestions = [];

    // Basic Info Suggestions
    if (!profile.avatar) {
        suggestions.push({
            section: 'basicInfo',
            field: 'avatar',
            message: 'Add a profile picture',
            priority: 'HIGH'
        });
    }

    if (!profile.bio) {
        suggestions.push({
            section: 'basicInfo',
            field: 'bio',
            message: 'Add a bio to your profile',
            priority: 'MEDIUM'
        });
    }

    // Personal Info Suggestions
    if (!profile.personalInformation?.contactNumbers) {
        suggestions.push({
            section: 'personalInfo',
            field: 'contact',
            message: 'Add your contact number',
            priority: 'HIGH'
        });
    }

    if (!profile.personalInformation[0]?.addresses.find(addr => addr.type === 'CURRENT')?.details) {
        suggestions.push({
            section: 'personalInfo',
            field: 'address',
            message: 'Add your current address',
            priority: 'MEDIUM'
        });
    }

    if (!profile.personalInformation[0]?.dateOfBirth) {
        suggestions.push({
            section: 'personalInfo',
            field: 'dateOfBirth',
            message: 'Add your date of birth',
            priority: 'LOW'
        });
    }

    // Education Suggestions
    if (!profile.educationQualification?.length) {
        suggestions.push({
            section: 'education',
            field: 'qualification',
            message: 'Add your educational background',
            priority: 'HIGH'
        });
    }

    // Verification Suggestions
    if (!profile.isVerified) {
        suggestions.push({
            section: 'verification',
            field: 'verify',
            message: 'Verify your account',
            priority: 'HIGH'
        });
    }

    return suggestions;
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} - Age in years
 */
const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/account/profile/update
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const {
        firstName,
        lastName,
        username,
        phoneNumber,
        bio,
        location,
        description,
        socialLinks,
        skills,
        languages
    } = req.body;

    try {
        // Check if username is taken
        if (username) {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUser && existingUser.id !== userId) {
                throw new ApiError(HTTP_STATUS.CONFLICT, 'Username is already taken');
            }
        }

        // Update basic profile information
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                username,
                phoneNumber,
                bio,
                location,
                description,
                socialLinks,
                skills,
                languages
            }
        });

        // Get updated profile
        const updatedProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                userID: true,
                username: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                description: true,
                avatar: true,
                cover: true,
                bio: true,
                location: true,
                role: true,
                accountStatus: true,
                isVerified: true,
                isEmailVerified: true,
                isSmsVerified: true,
                darkModeEnabled: true,
                languagePreference: true,
                profileCompletionPercentage: true,
                reputationScore: true,
                membershipTier: true,
                lastActive: true,
                activeStatus: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Profile update error details:', {
            error: error,
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        if (error instanceof ApiError) {
            throw error;
        }

        if (error.code) {
            switch (error.code) {
                case 'P2002':
                    throw new ApiError(
                        HTTP_STATUS.CONFLICT,
                        'This username or phone number is already taken'
                    );
                case 'P2025':
                    throw new ApiError(
                        HTTP_STATUS.NOT_FOUND,
                        'User profile not found'
                    );
                default:
                    throw new ApiError(
                        HTTP_STATUS.INTERNAL_SERVER_ERROR,
                        `Database error: ${error.message}`
                    );
            }
        }

        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            `Failed to update profile: ${error.message}`
        );
    }
});

/**
 * @desc    Update avatar
 * @route   PATCH /api/v1/account/profile/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please upload an image');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
    });

    if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
    }

    const result = await uploadOnCloudinary(file, 'avatars', 'image', {
        preset: 'profile'
    });

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
        select: {
            id: true,
            avatar: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Avatar updated successfully',
        data: updatedUser
    });
});

/**
 * @desc    Delete avatar
 * @route   DELETE /api/v1/account/profile/avatar
 * @access  Private
 */
export const deleteAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
    });

    if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
    }

    await prisma.user.update({
        where: { id: userId },
        data: { avatar: null }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Avatar deleted successfully'
    });
});

/**
 * @desc    Update cover image
 * @route   PATCH /api/v1/account/profile/cover
 * @access  Private
 */
export const updatecover = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please upload an image');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cover: true }
    });

    if (user.cover) {
        await deleteFromCloudinary(user.cover);
    }

    const result = await uploadOnCloudinary(file, 'covers', 'image', {
        preset: 'cover'
    });

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { cover: result.secure_url },
        select: {
            id: true,
            cover: true,
            updatedAt: true
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cover image updated successfully',
        data: updatedUser
    });
});

/**
 * @desc    Delete cover image
 * @route   DELETE /api/v1/account/profile/cover
 * @access  Private
 */
export const deletecover = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cover: true }
    });

    if (!user.cover) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'No cover image found');
    }

    // Delete cover image from Cloudinary
    await deleteFromCloudinary(user.cover);

    // Remove cover image URL from user record
    await prisma.user.update({
        where: { id: userId },
        data: { cover: null }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cover image deleted successfully'
    });
});

export default {
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    updatecover,
    deletecover
};
