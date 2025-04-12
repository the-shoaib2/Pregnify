import prisma from '../../../../utils/database/prisma.js';
import ApiError from '../../../../utils/error/api.error.js';
import asyncHandler from '../../../../utils/middleware/async.handler.js';
import { HTTP_STATUS } from '../../../../constants/index.js';
import { validateContactNumber, validateAddress, validateWebsite } from '../../../../validators/account/profile/contact.validator.js';

/**
 * @desc    Get all contact information
 * @route   GET /api/v1/account/profile/contact
 * @access  Private
 */
export const getContactInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const contactInfo = await prisma.personalInformation.findUnique({
        where: { userId },
        include: {
            contactNumbers: true,
            addresses: true,
            websites: true
        }
    });

    if (!contactInfo) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact information not found');
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contact information retrieved successfully',
        data: contactInfo
    });
});

/**
 * @desc    Create contact number
 * @route   POST /api/v1/account/profile/contact/numbers
 * @access  Private
 */
export const createContactNumber = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { number, isPrimary = false, isVerified = false } = req.body;

    // Check if the number already exists
    const existingNumber = await prisma.contactNumber.findUnique({
        where: { number }
    });

    if (existingNumber) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This phone number is already in use');
    }

    // If setting as primary, unmark any existing primary numbers
    if (isPrimary) {
        await prisma.contactNumber.updateMany({
            where: {
                userId,
                isPrimary: true
            },
            data: {
                isPrimary: false
            }
        });
    }

    try {
        const newContactNumber = await prisma.contactNumber.create({
            data: {
                userId,
                number,
                isPrimary,
                isVerified
            }
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Contact number created successfully',
            data: newContactNumber
        });
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('contact_numbers_number_key')) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This phone number is already in use');
        }
        throw error;
    }
});

/**
 * @desc    Update contact number
 * @route   PUT /api/v1/account/profile/contact/numbers/:id
 * @access  Private
 */
export const updateContactNumber = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contactNumberId = req.params.id;
    const { number, isPrimary = false, isVerified = false } = req.body;

    // Check if the number already exists for another contact
    const existingNumber = await prisma.contactNumber.findFirst({
        where: {
            number,
            id: { not: contactNumberId }
        }
    });

    if (existingNumber) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This phone number is already in use');
    }

    // Get the current contact number to check if it was primary
    const currentNumber = await prisma.contactNumber.findUnique({
        where: { id: contactNumberId }
    });

    // If the current number was primary and we're updating it to non-primary
    if (currentNumber?.isPrimary && !isPrimary) {
        // If there are no other primary numbers, throw an error
        const otherPrimaryNumbers = await prisma.contactNumber.count({
            where: {
                userId,
                isPrimary: true,
                id: { not: contactNumberId }
            }
        });

        if (otherPrimaryNumbers === 0) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one primary number must exist');
        }
    }

    // If setting as primary, unmark any existing primary numbers
    if (isPrimary) {
        await prisma.contactNumber.updateMany({
            where: {
                userId,
                isPrimary: true,
                id: { not: contactNumberId }
            },
            data: {
                isPrimary: false
            }
        });
    }

    try {
        const updatedContactNumber = await prisma.contactNumber.update({
            where: { id: contactNumberId },
            data: {
                number,
                isPrimary,
                isVerified
            }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Contact number updated successfully',
            data: updatedContactNumber
        });
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('contact_numbers_number_key')) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This phone number is already in use');
        }
        throw error;
    }
});

/**
 * @desc    Delete contact number
 * @route   DELETE /api/v1/account/profile/contact/numbers/:id
 * @access  Private
 */
export const deleteContactNumber = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const contactNumberId = req.params.id;

    await prisma.contactNumber.delete({
        where: { id: contactNumberId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contact number deleted successfully'
    });
});

/**
 * @desc    Create address
 * @route   POST /api/v1/account/profile/contact/addresses
 * @access  Private
 */
export const createAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, street, city, state, country, postalCode, isPrimary = false } = req.body;

    // Validate address type
    const validTypes = ['CURRENT', 'PRESENT', 'PERMANENT', 'WORK', 'HOME', 'OFFICE', 'OTHER'];
    if (!validTypes.includes(type)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid address type');
    }

    // Create address details as JSON
    const addressDetails = {
        street,
        city,
        state,
        country,
        postalCode,
        isPrimary
    };

    try {
        const newAddress = await prisma.address.create({
            data: {
                userId,
                type,
                details: addressDetails
            }
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Address created successfully',
            data: {
                ...newAddress,
                ...addressDetails
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This address already exists');
        }
        throw error;
    }
});

/**
 * @desc    Update address
 * @route   PUT /api/v1/account/profile/contact/addresses/:id
 * @access  Private
 */
export const updateAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { type, street, city, state, country, postalCode, isPrimary = false } = req.body;

    // Validate address type
    const validTypes = ['CURRENT', 'PRESENT', 'PERMANENT', 'WORK', 'HOME', 'OFFICE', 'OTHER'];
    if (!validTypes.includes(type)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid address type');
    }

    // Create updated address details
    const addressDetails = {
        street,
        city,
        state,
        country,
        postalCode,
        isPrimary
    };

    try {
        const updatedAddress = await prisma.address.update({
            where: { id: addressId },
            data: {
                type,
                details: addressDetails
            }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Address updated successfully',
            data: {
                ...updatedAddress,
                ...addressDetails
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This address already exists');
        }
        throw error;
    }
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/account/profile/contact/addresses/:id
 * @access  Private
 */
export const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    await prisma.address.delete({
        where: { id: addressId }
    });

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Address deleted successfully'
    });
});

/**
 * @desc    Create website
 * @route   POST /api/v1/account/profile/contact/websites
 * @access  Private
 */
export const createWebsite = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { category, name, url, username } = req.body;

    // Validate URL
    if (!url) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'URL is required');
    }

    // Check if the URL already exists
    const existingWebsite = await prisma.website.findUnique({
        where: { url }
    });

    if (existingWebsite) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This URL is already in use');
    }

    try {
        const newWebsite = await prisma.website.create({
            data: {
                userId,
                category,
                name,
                url,
                username
            }
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Website created successfully',
            data: newWebsite
        });
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('websites_url_key')) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This URL is already in use');
        }
        throw error;
    }
});

/**
 * @desc    Update website
 * @route   PUT /api/v1/account/profile/contact/websites/:id
 * @access  Private
 */
export const updateWebsite = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const websiteId = req.params.id;
    const { category, name, url, username } = req.body;

    // Validate URL
    if (url) {
        // Check if the URL already exists for another website
        const existingWebsite = await prisma.website.findFirst({
            where: {
                url,
                id: { not: websiteId }
            }
        });

        if (existingWebsite) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This URL is already in use');
        }
    }

    try {
        const updatedWebsite = await prisma.website.update({
            where: { id: websiteId },
            data: {
                category,
                name,
                url,
                username
            }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Website updated successfully',
            data: updatedWebsite
        });
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('websites_url_key')) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This URL is already in use');
        }
        throw error;
    }
});

/**
 * @desc    Delete website
 * @route   DELETE /api/v1/account/profile/contact/websites/:id
 * @access  Private
 */
export const deleteWebsite = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const websiteId = req.params.id;

    try {
        await prisma.website.delete({
            where: { id: websiteId }
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Website deleted successfully'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Website not found');
        }
        throw error;
    }
});

export default {
    getContactInfo,
    createContactNumber,
    updateContactNumber,
    deleteContactNumber,
    createAddress,
    updateAddress,
    deleteAddress,
    createWebsite,
    updateWebsite,
    deleteWebsite
};