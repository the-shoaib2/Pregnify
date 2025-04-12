import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * Search for users with a single identifier
 * @param {Object} params Search parameters
 * @param {string} params.identify User identifier (email, username, phone, or name)
 * @returns {Promise<Object>} Search results
 * @throws {ApiError} If the search parameters are invalid
 */
export const searchUser = async ({ identify }) => {
    if (!identify || typeof identify !== 'string') {
        throw ApiError.badRequest('Invalid search parameter');
    }

    const trimmedIdentify = identify.trim();
    if (!trimmedIdentify) {
        throw ApiError.badRequest('Search parameter cannot be empty');
    }

    try {
        // Determine search type and build query
        const { searchQuery, isNameSearch } = buildSearchQuery(trimmedIdentify);
        
        // Execute search query with timeout
        const users = await Promise.race([
            // If it's a name search, find multiple users, otherwise find first
            isNameSearch ? 
                prisma.user.findMany({
                    ...searchQuery,
                    take: 10 // Limit results to 10 users
                }) :
                prisma.user.findFirst(searchQuery).then(user => user ? [user] : []),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Search timeout')), 5000)
            )
        ]);

        return formatSearchResponse(users, isNameSearch);
    } catch (error) {
        if (error.code === 'P2023') {
            throw ApiError.databaseValidationError('Invalid search format');
        }
        if (error.message === 'Search timeout') {
            throw ApiError.serviceUnavailable('Search operation timed out');
        }
        throw ApiError.databaseError('Error performing search', [error.message]);
    }
};

/**
 * Build the search query based on the identifier type
 * @private
 */
function buildSearchQuery(identify) {
    const searchTypes = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?\d{10,}$/,
        userId: /^[A-Z_]+-\d{4}-\d{6}$/
    };

    const searchQuery = {
        where: {
            AND: [
                { accountStatus: { not: "DELETED" } }
            ]
        },
        select: {
            id: true,
            userID: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            isEmailVerified: true,
            isSmsVerified: true,
            avatar: true,
            twoFactorEnabled: true,
            securityQuestions: {
                select: { id: true, question: true }
            },
            trustedDevices: {
                where: {
                    isRevoked: false,
                    expiresAt: { gt: new Date() }
                },
                select: {
                    id: true,
                    deviceName: true,
                    lastUsed: true
                }
            }
        }
    };

    let isNameSearch = false;

    // Determine search type and build corresponding query
    if (searchTypes.userId.test(identify)) {
        searchQuery.where.AND.push({ userID: { equals: identify } });
    } else if (searchTypes.email.test(identify)) {
        searchQuery.where.AND.push({ email: { equals: identify.toLowerCase() } });
    } else if (searchTypes.phone.test(identify)) {
        const normalizedPhone = identify.replace(/\D/g, '');
        searchQuery.where.AND.push({
            OR: [
                { phoneNumber: { equals: normalizedPhone } },
                { phoneNumber: { equals: normalizedPhone.slice(-10) } },
                { phoneNumber: { endsWith: normalizedPhone.slice(-10) } }
            ]
        });
    } else {
        // Name or username search
        const nameParts = identify.toLowerCase().split(' ').filter(Boolean);
        searchQuery.where.AND.push(buildNameSearchCondition(nameParts, identify));
        isNameSearch = true;
    }

    return { searchQuery, isNameSearch };
}

/**
 * Build name search conditions
 * @private
 */
function buildNameSearchCondition(nameParts, originalInput) {
    const conditions = [
        { username: { equals: originalInput.startsWith('@') ? 
            originalInput.toLowerCase() : 
            `@${originalInput.toLowerCase()}` 
        }}
    ];

    if (nameParts.length === 1) {
        conditions.push(
            { firstName: { contains: nameParts[0] } },
            { lastName: { contains: nameParts[0] } },
            { userID: { contains: originalInput.toUpperCase() } }
        );
    } else {
        conditions.push(
            {
                AND: [
                    { firstName: { contains: nameParts[0] } },
                    { lastName: { contains: nameParts[nameParts.length - 1] } }
                ]
            },
            {
                AND: [
                    { firstName: { contains: nameParts[nameParts.length - 1] } },
                    { lastName: { contains: nameParts[0] } }
                ]
            }
        );
    }

    return { OR: conditions };
}

/**
 * Format the search response
 * @private
 */
function formatSearchResponse(users, isNameSearch) {
    if (!users.length) {
        return {
            success: false,
            message: 'If an account exists with these details, you will receive further instructions.',
            data: { found: false }
        };
    }

    // If it's not a name search and we found multiple users (shouldn't happen), just use the first one
    if (!isNameSearch) {
        const user = users[0];
        return formatSingleUserResponse(user);
    }

    // For name searches, return multiple users
    return {
        success: true,
        message: `Found ${users.length} matching users`,
        data: {
            found: true,
            multipleUsers: true,
            users: users.map(user => ({
                userId: user.id,
                userID: user.userID,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${user.firstName} ${user.lastName}`
                )}&background=random`,
                maskedEmail: user.email.replace(/(?<=.{3}).(?=.*@)/g, '*'),
                maskedPhone: user.phoneNumber ? 
                    user.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2') : 
                    null,
                recoveryMethods: buildRecoveryMethods(user)
            }))
        }
    };
}

/**
 * Format response for a single user
 * @private
 */
function formatSingleUserResponse(user) {
    return {
        success: true,
        message: 'User found',
        data: {
            found: true,
            userId: user.id,
            userID: user.userID,
            username: user.username,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                `${user.firstName} ${user.lastName}`
            )}&background=random`,
            maskedEmail: user.email.replace(/(?<=.{3}).(?=.*@)/g, '*'),
            maskedPhone: user.phoneNumber ? 
                user.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2') : 
                null,
            recoveryMethods: buildRecoveryMethods(user)
        }
    };
}

/**
 * Build recovery methods object for a user
 * @private
 */
function buildRecoveryMethods(user) {
    return {
        email: user.isEmailVerified ? {
            type: 'email',
            value: user.email.replace(/(?<=.{3}).(?=.*@)/g, '*'),
            options: ['code', 'link']
        } : null,
        sms: user.isSmsVerified && user.phoneNumber ? {
            type: 'sms',
            value: user.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2'),
            options: ['code']
        } : null,
        securityQuestions: user.securityQuestions.length > 0 ? {
            type: 'security_questions',
            count: user.securityQuestions.length
        } : null,
        trustedDevices: user.trustedDevices.length > 0 ? {
            type: 'trusted_devices',
            devices: user.trustedDevices.map(d => ({
                id: d.id,
                name: d.deviceName,
                lastUsed: d.lastUsed
            }))
        } : null
    };
} 