import prisma from '../../../../utils/database/prisma.js';
import ApiError from '../../../../utils/error/api.error.js';
import asyncHandler from '../../../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../../../constants/index.js';

/**
 * @desc    Get all personal information including education and medical
 * @route   GET /api/v1/account/profile/personal
 * @access  Private
 */
export const getAllPersonalInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const personalInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            personalInformation: {
                include: {
                    emergencyContact: true
                }
            },
            educationQualification: {
                orderBy: {
                    startYear: 'desc'
                }
            },
            medicalInformation: {
                include: {
                    medicalReports: true,
                    prescriptions: true
                }
            }
        }
    });

    if (!personalInfo) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Personal information not found');
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Personal information retrieved successfully',
        data: personalInfo
    });
});

/**
 * @desc    Create/Update personal information
 * @route   PUT /api/v1/account/profile/personal/basic
 * @access  Private
 */
export const updatePersonalInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        firstName,
        middleName,
        lastName,
        nickName,
        genderIdentity,
        dateOfBirth,
        description,
        maritalStatus,
        occupation,
        religion,
        hobbies,
        additionalInfo
    } = req.body;

    try {

        const updatedInfo = await prisma.personalInformation.upsert({
            where: { userId },
            update: {
                firstName,
                middleName,
                lastName,
                nickName,
                genderIdentity,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                description,
                maritalStatus,
                occupation: occupation ? JSON.parse(JSON.stringify(occupation)) : undefined,
                religion,
                hobbies: hobbies ? JSON.parse(JSON.stringify(hobbies)) : undefined,
                additionalInfo: additionalInfo ? JSON.parse(JSON.stringify(additionalInfo)) : undefined
            },
            create: {
                userId,
                firstName,
                middleName,
                lastName,
                nickName,
                genderIdentity,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                description,
                maritalStatus,
                occupation: occupation ? JSON.parse(JSON.stringify(occupation)) : undefined,
                religion,
                hobbies: hobbies ? JSON.parse(JSON.stringify(hobbies)) : undefined,
                additionalInfo: additionalInfo ? JSON.parse(JSON.stringify(additionalInfo)) : undefined
            }
        });

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName + ' ' + middleName,
                lastName: lastName
            },
            select: {
                firstName: true,
                lastName: true
            }
        });


        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Personal information updated successfully',
            data: {
                user,
                updatedInfo
            }
        });
        // Log the activity
        await prisma.userActivityLog.create({
            data: {
                userId: userId,
                activityType: "PROFILE_UPDATE",
                description: "Personal information update",
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('user-agent') || 'unknown',
                metadata: {
                    firstName,
                    lastName,
                    nickName,
                    genderIdentity,
                    dateOfBirth,
                    maritalStatus,
                    occupation,
                    religion,
                    hobbies,
                    additionalInfo
                }
            }
        });

    } catch (error) {
        console.error('Error updating personal information:', error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update personal information');
    }
});

/**
 * Helper function to validate education dates
 */
const validateEducationDates = (startYear, endYear, isOngoing) => {
    const currentYear = new Date().getFullYear();

    // Convert years to numbers
    const start = parseInt(startYear);
    const end = endYear ? parseInt(endYear) : null;

    // Validate start year
    if (isNaN(start) || start < 1900 || start > currentYear) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid start year");
    }

    // Handle ongoing education
    if (isOngoing) {
        return {
            startYear: start,
            endYear: null,
            isOngoing: true
        };
    }

    // Validate end year if provided
    if (end) {
        if (isNaN(end) || end < start) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid end year");
        }
        return {
            startYear: start,
            endYear: end,
            isOngoing: false
        };
    }

    return {
        startYear: start,
        endYear: null,
        isOngoing: true
    };
};

/**
 * @desc    Create education qualification
 * @route   POST /api/v1/account/profile/personal/education
 * @access  Private
 */
export const addEducation = asyncHandler(async (req, res) => {
    const {
        degree,
        fieldOfStudy,
        qualification,
        institution,
        startYear,
        endYear,
        isOngoing,
        gpa
    } = req.body;

    // Validate required fields
    if (!degree || !fieldOfStudy || !institution || !startYear) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Missing required fields");
    }

    try {
        // Validate and parse education dates
        const dateInfo = validateEducationDates(startYear, endYear, isOngoing);

        // Create education record
        const education = await prisma.educationQualification.create({
            data: {
                userId: req.user.id,
                degree,
                fieldOfStudy,
                qualification,
                institution,
                startYear: dateInfo.startYear,
                endYear: dateInfo.endYear,
                isOngoing: dateInfo.isOngoing,
                gpa: gpa ? parseFloat(gpa) : null
            }
        });

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Education record added successfully",
            data: education
        });

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Log the actual error for debugging
        console.error('Error adding education record:', error);
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "Failed to add education record: " + (error.message || "Unknown error")
        );
    }
});

/**
 * @desc    Get all education qualifications
 * @route   GET /api/v1/account/profile/personal/education
 * @access  Private
 */
export const getAllEducation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const education = await prisma.educationQualification.findMany({
        where: { userId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Education qualifications retrieved successfully',
        data: education
    });
});

/**
 * @desc    Get education qualification by ID
 * @route   GET /api/v1/account/profile/personal/education/:id
 * @access  Private
 */
export const getEducationById = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const educationId = req.params.id;

    const education = await prisma.educationQualification.findFirst({
        where: {
            id: educationId,
            userId
        }
    });

    if (!education) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Education qualification not found');
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Education qualification retrieved successfully',
        data: education
    });
});

/**
 * @desc    Update education qualification
 * @route   PUT /api/v1/account/profile/personal/education/:id
 * @access  Private
 */
export const updateEducation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const educationId = req.params.id;
    const {
        degree,
        fieldOfStudy,
        qualification,
        institution,
        startYear,
        endYear,
        isOngoing,
        gpa
    } = req.body;

    // Check if education exists and belongs to user
    const existingEducation = await prisma.educationQualification.findFirst({
        where: {
            id: educationId,
            userId
        }
    });

    if (!existingEducation) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Education qualification not found');
    }

    const education = await prisma.educationQualification.update({
        where: { id: educationId },
        data: {
            degree,
            fieldOfStudy,
            qualification,
            institution,
            startYear,
            endYear,
            isOngoing,
            gpa: gpa ? parseFloat(gpa) : null
        }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Education qualification updated successfully',
        data: education
    });
});

/**
 * @desc    Delete education qualification
 * @route   DELETE /api/v1/account/profile/personal/education/:id
 * @access  Private
 */
export const deleteEducation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const educationId = req.params.id;

    const existingEducation = await prisma.educationQualification.findFirst({
        where: {
            id: educationId,
            userId
        }
    });

    if (!existingEducation) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Education qualification not found');
    }

    await prisma.educationQualification.delete({
        where: { id: educationId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Education qualification deleted successfully'
    });
});

/**
 * @desc    Create/Update medical information
 * @route   PUT /api/v1/account/profile/personal/medical
 * @access  Private
 */
export const updateMedicalInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        medicalHistory,
        chronicDiseases,
        cancerHistory,
        cancerType,
        allergies,
        medications,
        bloodGroup,
        organDonor,
        vaccinationRecords,
        geneticDisorders,
        disabilities,
        emergencyContact,
        primaryPhysician
    } = req.body;

    try {
        const updatedInfo = await prisma.medicalInformation.upsert({
            where: { userId },
            update: {
                medicalHistory: medicalHistory ? JSON.parse(JSON.stringify(medicalHistory)) : undefined,
                chronicDiseases: chronicDiseases ? JSON.parse(JSON.stringify(chronicDiseases)) : undefined,
                cancerHistory,
                cancerType,
                allergies,
                medications,
                bloodGroup,
                organDonor,
                vaccinationRecords,
                geneticDisorders,
                disabilities,
                emergencyContact,
                primaryPhysician
            },
            create: {
                userId,
                medicalHistory: medicalHistory ? JSON.parse(JSON.stringify(medicalHistory)) : undefined,
                chronicDiseases: chronicDiseases ? JSON.parse(JSON.stringify(chronicDiseases)) : undefined,
                cancerHistory,
                cancerType,
                allergies,
                medications,
                bloodGroup,
                organDonor,
                vaccinationRecords,
                geneticDisorders,
                disabilities,
                emergencyContact,
                primaryPhysician
            }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Medical information updated successfully',
            data: updatedInfo
        });
    } catch (error) {
        console.error('Error updating medical information:', error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update medical information');
    }
});

/**
 * @desc    Add medical report
 * @route   POST /api/v1/account/profile/personal/medical/reports
 * @access  Private
 */
export const addMedicalReport = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        reportType,
        reportDate,
        reportDetails,
        doctorId
    } = req.body;

    // Validate required fields
    if (!reportType) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Report type is required');
    }

    // Validate and parse date
    const parsedDate = reportDate ? new Date(reportDate) : new Date();
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid report date format');
    }

    // First, get the medical information ID
    const medicalInfo = await prisma.medicalInformation.findUnique({
        where: { userId }
    });

    if (!medicalInfo) {
        // Create medical information if it doesn't exist
        const newMedicalInfo = await prisma.medicalInformation.create({
            data: {
                userId,
                medicalHistory: {},
                chronicDiseases: {}
            }
        });
        medicalInfo = newMedicalInfo;
    }

    const report = await prisma.medicalReport.create({
        data: {
            medicalInfoId: medicalInfo.id,
            reportType,
            reportDate: parsedDate,
            reportDetails: reportDetails ? JSON.parse(JSON.stringify(reportDetails)) : {},
            doctorId: doctorId || null
        }
    });

    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Medical report added successfully',
        data: report
    });
});

/**
 * @desc    Update medical report
 * @route   PUT /api/v1/account/profile/personal/medical/reports/:id
 * @access  Private
 */
export const updateMedicalReport = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reportId = req.params.id;
    const {
        reportType,
        reportDate,
        reportDetails,
        doctorId
    } = req.body;

    // Verify the report belongs to the user
    const medicalInfo = await prisma.medicalInformation.findUnique({
        where: { userId },
        include: {
            medicalReports: {
                where: { id: reportId }
            }
        }
    });

    if (!medicalInfo || medicalInfo.medicalReports.length === 0) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Medical report not found');
    }

    // Prepare update data with only provided fields
    const updateData = {};

    if (reportType !== undefined) {
        updateData.reportType = reportType;
    }

    if (reportDate !== undefined) {
        const parsedDate = new Date(reportDate);
        if (isNaN(parsedDate.getTime())) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid report date format');
        }
        updateData.reportDate = parsedDate;
    }

    if (reportDetails !== undefined) {
        updateData.reportDetails = JSON.parse(JSON.stringify(reportDetails));
    }

    if (doctorId !== undefined) {
        updateData.doctorId = doctorId;
    }

    const report = await prisma.medicalReport.update({
        where: { id: reportId },
        data: updateData
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Medical report updated successfully',
        data: report
    });
});

/**
 * @desc    Delete medical report
 * @route   DELETE /api/v1/account/profile/personal/medical/reports/:id
 * @access  Private
 */
export const deleteMedicalReport = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reportId = req.params.id;

    // Verify the report belongs to the user
    const medicalInfo = await prisma.medicalInformation.findUnique({
        where: { userId },
        include: {
            medicalReports: {
                where: { id: reportId }
            }
        }
    });

    if (!medicalInfo || medicalInfo.medicalReports.length === 0) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Medical report not found');
    }


    await prisma.medicalReport.delete({
        where: { id: reportId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Medical report deleted successfully'
    });


});

export default {
    // Personal Information
    getAllPersonalInfo,
    updatePersonalInfo,
    // Education
    addEducation,
    updateEducation,
    deleteEducation,
    // Medical Information

    updateMedicalInfo,
    // Medical Reports
    addMedicalReport,
    updateMedicalReport,
    deleteMedicalReport
}; 