import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';

/**
 * @desc    Get all emergency contacts for a user
 * @route   GET /api/v1/account/emergency/contacts
 */
export const getEmergencyContacts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const contacts = await prisma.emergencyContact.findMany({
        where: {
            userId,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            relation: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.json({
        success: true,
        data: contacts
    });
});

/**
 * @desc    Add a new emergency contact
 * @route   POST /api/v1/account/emergency/contacts
 */
export const addEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, relation, phone } = req.body;

    // Get user's personal information ID
    const personalInfo = await prisma.personalInformation.findUnique({
        where: { userId }
    });

    if (!personalInfo) {
        throw new ApiError(404, 'Personal information not found');
    }

    const contact = await prisma.emergencyContact.create({
        data: {
            userId,
            personalInformationId: personalInfo.id,
            name,
            relation,
            phone
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'EMERGENCY_CONTACT_ADDED',
            description: 'Added emergency contact',
            metadata: { contactId: contact.id }
        }
    });

    res.status(201).json({
        success: true,
        message: 'Emergency contact added successfully',
        data: contact
    });
});

/**
 * @desc    Update an emergency contact
 * @route   PUT /api/v1/account/emergency/contacts/:id
 */
export const updateEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, relation, phone } = req.body;

    const contact = await prisma.emergencyContact.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!contact) {
        throw new ApiError(404, 'Emergency contact not found');
    }

    const updated = await prisma.emergencyContact.update({
        where: { id },
        data: {
            name,
            relation,
            phone,
            updatedAt: new Date()
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'EMERGENCY_CONTACT_UPDATED',
            description: 'Updated emergency contact',
            metadata: { contactId: id }
        }
    });

    res.json({
        success: true,
        message: 'Emergency contact updated successfully',
        data: updated
    });
});

/**
 * @desc    Remove an emergency contact
 * @route   DELETE /api/v1/account/emergency/contacts/:id
 */
export const removeEmergencyContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const contact = await prisma.emergencyContact.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!contact) {
        throw new ApiError(404, 'Emergency contact not found');
    }

    // Soft delete the contact
    await prisma.emergencyContact.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'EMERGENCY_CONTACT_REMOVED',
            description: 'Removed emergency contact',
            metadata: { contactId: id }
        }
    });

    res.json({
        success: true,
        message: 'Emergency contact removed successfully'
    });
});

/**
 * @desc    Get all emergency requests
 * @route   GET /api/v1/account/emergency/requests
 */
export const getEmergencyRequests = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const requests = await prisma.emergencyRequest.findMany({
        where: {
            userId,
            deletedAt: null
        },
        select: {
            id: true,
            message: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.json({
        success: true,
        data: requests
    });
});

/**
 * @desc    Create a new emergency request
 * @route   POST /api/v1/account/emergency/requests
 */
export const createEmergencyRequest = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    const request = await prisma.emergencyRequest.create({
        data: {
            userId,
            message
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'EMERGENCY_REQUEST_CREATED',
            description: 'Created emergency request',
            metadata: { requestId: request.id }
        }
    });

    res.status(201).json({
        success: true,
        message: 'Emergency request created successfully',
        data: request
    });
});

/**
 * @desc    Cancel an emergency request
 * @route   DELETE /api/v1/account/emergency/requests/:id
 */
export const cancelEmergencyRequest = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const request = await prisma.emergencyRequest.findFirst({
        where: {
            id,
            userId,
            deletedAt: null
        }
    });

    if (!request) {
        throw new ApiError(404, 'Emergency request not found');
    }

    // Soft delete the request
    await prisma.emergencyRequest.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });

    // Log activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'EMERGENCY_REQUEST_CANCELLED',
            description: 'Cancelled emergency request',
            metadata: { requestId: id }
        }
    });

    res.json({
        success: true,
        message: 'Emergency request cancelled successfully'
    });
}); 