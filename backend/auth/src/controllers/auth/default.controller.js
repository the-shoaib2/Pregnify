import bcrypt from 'bcrypt';
import { generateTokens } from '../token/token.controller.js';
import { generateUsername } from '../../utils/user/username.generator.js';
import { generateUserID } from '../../utils/user/userID.generator.js';
import { hashPassword } from '../../utils/auth/auth.utils.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import ApiError from '../../utils/error/api.error.js';
import { emailService } from '../../helpers/email/email_service.js';
import {
    ACCOUNT_EXPIRY_TIME,
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
    HTTP_STATUS
} from '../../constants/index.js';

import { USER_DEFINITIONS } from '../../constants/roles.constants.js';

import prisma from '../../utils/database/prisma.js';
import { LoginService } from '../../services/login.service.js';
import crypto from 'crypto';

/**
 * Sets authentication cookies for both access and refresh tokens
 * @description Sets secure HTTP-only cookies for authentication tokens with configurable expiry times.
 *              The cookies are secure in production and use strict same-site policy.
 * 
 * @param {Object} params - The parameters object
 * @param {Express.Response} params.res - Express response object
 * @param {Object} params.tokens - Token object containing access and refresh tokens
 * @param {string} params.tokens.accessToken - JWT access token
 * @param {string} params.tokens.refreshToken - JWT refresh token
 * @param {number} [params.accessTokenExpiry] - Access token expiry in milliseconds
 * @param {number} [params.refreshTokenExpiry] - Refresh token expiry in milliseconds
 * @returns {Promise<void>}
 * 
 * @example
 *  setAuthCookies({ res, tokens, accessTokenExpiry, refreshTokenExpiry });
 */
const setAuthCookies = ({ res, tokens, accessTokenExpiry, refreshTokenExpiry }) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict',
        path: '/'
    };

    // Set refresh token cookie with expiry in milliseconds
    res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiry || REFRESH_TOKEN_EXPIRES
    });

    // Set access token cookie with expiry in milliseconds
    res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: accessTokenExpiry || ACCESS_TOKEN_EXPIRES
    });

    // Set Authorization header
    res.set('Authorization', `Bearer ${tokens.accessToken}`);
};

/**
 * @description Handles user registration
 * @param {Object} req - The request object containing user details
 * @param {Object} res - The response object to send the response
 * @throws {ApiError} - Throws an error if user data is invalid
 * @returns {Promise<void>}
 * 
 * @example
 *  defaultRegister(req, res);
 */
export const defaultRegister = asyncHandler(async (req, res) => {
    try {
        const {
            role = "GUEST", // Set default role
            email,
            firstName,
            lastName,
            password,
            confirmPassword,
            gender,
            dateOfBirth,
            phoneNumber,
            termsAccepted,
            description
        } = req.body;

        // Validate required fields
        if (!email || !firstName || !lastName || !password || !confirmPassword || !termsAccepted) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Missing required fields");
        }

        // Check if trying to create SUPER_ADMIN
        if (role.toUpperCase() === 'SUPER_ADMIN') {
            // Check if SUPER_ADMIN already exists
            const existingSuperAdmin = await prisma.user.findFirst({
                where: { role: 'SUPER_ADMIN' }
            });

            if (existingSuperAdmin) {
                throw new ApiError(HTTP_STATUS.FORBIDDEN, "Super Admin account already exists. Only one Super Admin account is allowed.");
            }
        }

        // Validate password match
        if (password !== confirmPassword) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Passwords do not match");
        }

        // Validate role
        const validRoles = Object.values(USER_DEFINITIONS);
        if (!validRoles.includes(role.toUpperCase())) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid role provided.");
        }

        // Convert dateOfBirth object to Date instance
        let parsedDateOfBirth = null;
        if (dateOfBirth && dateOfBirth.day && dateOfBirth.month && dateOfBirth.year) {
            parsedDateOfBirth = new Date(
                dateOfBirth.year,
                dateOfBirth.month - 1, // JavaScript months are 0-based
                dateOfBirth.day
            );

            // Validate date
            if (isNaN(parsedDateOfBirth.getTime())) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid date of birth");
            }
        }

        // Check existing user by email
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            throw new ApiError(HTTP_STATUS.CONFLICT, "User with this email already exists.");
        }

        // Check existing user by phone number if provided
        if (phoneNumber) {
            const existingPhone = await prisma.user.findUnique({
                where: { phoneNumber }
            });

            if (existingPhone) {
                throw new ApiError(HTTP_STATUS.CONFLICT, "User with this phone number already exists.");
            }
        }

        // Create user with related data in a transaction
        const newUser = await prisma.$transaction(async (prisma) => {
            // Generate username and userID
            const username = await generateUsername(firstName, lastName);
            const userID = await generateUserID(role);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Hash the password
            const hashedPassword = await hashPassword(password);
            if (!hashedPassword) {
                throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to hash password");
            }

            // Set account expiry to 30 days from now if ACCOUNT_EXPIRY_TIME is not a valid number
            const expiryTime = typeof ACCOUNT_EXPIRY_TIME === 'number' ? ACCOUNT_EXPIRY_TIME : 30 * 24 * 60 * 60 * 1000;
            const expiryDateAt = new Date(Date.now() + expiryTime);

            // Create the main user
            const user = await prisma.user.create({
                data: {
                    email,
                    username,
                    userID,
                    password_hash: hashedPassword,
                    firstName,
                    lastName,
                    phoneNumber: phoneNumber || null,
                    role: role.toUpperCase(),
                    termsAccepted,
                    isVerified: false,
                    description: description || null,
                    expiryDateAt: expiryDateAt || null,
                    verificationToken,
                    verificationExpires,
                    personalInformation: {
                        create: {
                            firstName,
                            lastName,
                            genderIdentity: gender || null,
                            dateOfBirth: parsedDateOfBirth,
                            description: description || null
                        }
                    },

                    preferences: {
                        create: {
                            preferences: {},
                            notifications: {},
                            settings: {},
                            customization: {},
                            privacySettings: {},
                            securityQuestions: {},
                            contentFilters: {}
                        }
                    },

                    activityLogSettings: {
                        create: {
                            logFailedLogin: true,
                            logAccountChanges: true,
                            logProfileUpdates: true
                        }
                    },

                    notificationPreferences: {
                        create: {
                            emailNotifications: true,
                            pushNotifications: true,
                            smsNotifications: false
                        }
                    },
                    passwordPolicy: {
                        create: {
                            minLength: 8,
                            maxLength: 64,
                            requireUppercase: true,
                            requireLowercase: true,
                            requireNumbers: true,
                            requireSpecialChars: true,
                            specialCharsList: "!@#$%^&*()_+-=[]{}|;:,.<>?",
                            maxPasswordAge: 90,
                            minPasswordAge: 1,
                            preventReusedPasswords: 5,
                            lockoutThreshold: 5,
                            lockoutDuration: 30
                        }
                    }
                }
            });

            // Create contact number if provided
            if (phoneNumber) {
                await prisma.contactNumber.create({
                    data: {
                        userId: user.id,
                        number: phoneNumber,
                        isPrimary: true,
                        isVerified: false
                    }
                });
            }

            // Send welcome email with verification link
            const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
            try {
                await emailService.sendWelcomeEmail(email, `${firstName} ${lastName}`, verificationLink);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail registration if email fails
            }

            await prisma.userActivityLog.create({
                data: {
                    userId: user.id,
                    activityType: "REGISTER",
                    timestamp: new Date(),
                    description: "New user registration"
                }
            });

            return user;
        });

        if (!newUser) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create user.");
        }

        // Generate tokens
        const tokens = await generateTokens(newUser);
        if (!tokens?.accessToken || !tokens?.refreshToken) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to generate authentication tokens');
        }

        // Set authentication cookies with millisecond values
        setAuthCookies({
            res,
            tokens,
            accessTokenExpiry: ACCESS_TOKEN_EXPIRES, // 15 minutes
            refreshTokenExpiry: REFRESH_TOKEN_EXPIRES // 30 days
        });

        // Update the last login time
        try {
            await prisma.$transaction([
                // Update user
                prisma.user.update({
                    where: { id: newUser.id },
                    data: {
                        lastLoginAt: new Date(),
                        failedLoginCount: 0
                    }
                }),

                // Create login history
                prisma.loginHistory.create({
                    data: {
                        userId: newUser.id,
                        ipAddress: req.ip || 'unknown',
                        userAgent: req.get('user-agent') || 'unknown',
                        macAddress: null,
                        deviceType: 'WEB',
                        successful: true,
                        loginAt: new Date()
                    }
                }),

                // Create activity log
                prisma.userActivityLog.create({
                    data: {
                        userId: newUser.id,
                        activityType: "LOGIN",
                        description: "User logged in successfully",
                        ipAddress: req.ip || 'unknown',
                        userAgent: req.get('user-agent') || 'unknown',
                        metadata: {
                            email: newUser.email,
                            role: newUser.role,
                            loginTime: new Date().toISOString()
                        }
                    }
                })
            ]);
        } catch (error) {
            console.error('Failed to update login records:', error);
            // Continue with registration even if updates fail
        }

        // Return success response
        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    userID: newUser.userID,
                    name: `${newUser.firstName} ${newUser.lastName}`,
                    role: newUser.role,
                    isVerified: newUser.isVerified,
                    isEmailVerified: newUser.isEmailVerified,
                },
                tokens: {
                    accessToken: tokens.accessToken
                }
            }
        });

    } catch (err) {
        // console.error('Registration error:', err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || "Internal server error");
    }
});

/**
 * @description Handles user login
 * @param {Object} req - The request object containing login credentials
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 * 
 * @example
 *  defaultLogin(req, res);
 */
export const defaultLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, !email?.trim() ? 'Email or username is required' : 'Password is required');
        }

        // Fetch user with minimal required fields
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.trim() },
                    { username: email.trim() }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                username: true,
                password_hash: true,
                role: true,
                isVerified: true,
                twoFactorEnabled: true
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        // Generate tokens and send immediate response
        const tokens = await generateTokens(user);

        setAuthCookies({ res, tokens });

        // Store login time in a local variable instead of session
        const loginTime = new Date();

        // Send immediate response
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: "Login successful!",
            success: true,
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
                is2FAEnabled: user.twoFactorEnabled
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });

        // Handle background tasks
        setImmediate(async () => {
            try {

                // Create a user object with only necessary information
                const userInfo = {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    isVerified: user.isVerified
                };

                // Update login records
                await LoginService.updateLoginRecords(user.id, {
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    deviceType: req.body.deviceType || 'OTHER',
                    location: req.body.location,
                    browser: req.body.browser,
                    os: req.body.os,
                    platform: req.body.platform,
                    isMobile: req.body.isMobile
                });

                // Send login notification with loginTime and proper user object
                await emailService.sendLoginNotificationEmail(userInfo, {
                    time: new Date().toLocaleString(),
                    device: req.get('user-agent') || 'unknown',
                    ip: req.ip || 'unknown',
                    securityLink: `${process.env.FRONTEND_URL}/account/security`,
                    loginTime: loginTime
                });
            } catch (error) {
                console.error('Background task error:', error);
            }
        });

    } catch (error) {
        // Log the full error for debugging
        console.error('Login error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // Handle known errors
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                status: 'error',
                message: error.message,
                success: false
            });
        }

        // Handle Prisma errors
        if (error.code) {
            switch (error.code) {
                case 'P2002':
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({
                        status: 'error',
                        message: 'Database constraint violation',
                        success: false
                    });
                case 'P2025':
                    return res.status(HTTP_STATUS.NOT_FOUND).json({
                        status: 'error',
                        message: 'Record not found',
                        success: false
                    });
                default:
                    console.error('Prisma error:', error);
                    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        status: 'error',
                        message: 'Database error occurred',
                        success: false
                    });
            }
        }

        // For any other unexpected errors
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Login failed. Please try again later',
            success: false
        });
    }
});

/**
 * @description Retrieves the current user's profile
 * @throws {ApiError} If the user is not found
 * @throws {ApiError} If there is a database error
 * @throws {ApiError} If the user data is invalid
 * @returns {Promise<void>}
 * 
 * @example
 *  getCurrentUser(req, res);
 * 
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw ApiError.unauthorized('No user found');
        }

        // Get user data with related information
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                // Basic Information
                id: true,
                userID: true,
                username: true,
                email: true,
                phoneNumber: true,
                role: true,
                accountStatus: true,
                isAccountLocked: true,
                accountSuspended: true,
                // isDeleted: true,
                termsAccepted: true,
                isVerified: true,
                isEmailVerified: true,
                isSmsVerified: true,
                isPublic: true,
                isPrivate: true,
                firstName: true,
                lastName: true,
                avatar: true,
                avatarThumb: true,
                cover: true,
                coverThumb: true,
                bio: true,
                location: true,
                // description: true,
                createdAt: true,
                updatedAt: true,
                expiryDateAt: true,

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
                        // description: true,
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
                        deletedAt: true
                    }
                },

                // Preferences
                preferences: {
                    select: {
                        id: true,
                        preferences: true,
                        notifications: true,
                        settings: true,
                        customization: true,
                        privacySettings: true,
                        securityQuestions: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },

                // // Statistics
                // statistics: {
                //     select: {
                //         postCount: true,
                //         commentCount: true,
                //         reactionCount: true,
                //         shareCount: true,
                //         engagementScore: true
                //     }
                // }
            }
        });

        if (!userData) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
        }

        // Return success response
        res.status(HTTP_STATUS.OK).json({
            message: "User authenticated successfully",
            success: true,
            user: {
                // Basic Information
                basicInfo: {
                    id: userData.id,
                    userID: userData.userID,
                    username: userData.username,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    role: userData.role,
                    avatar: userData.avatar,
                    avatarThumb: userData.avatarThumb,
                    cover: userData.cover,
                    coverThumb: userData.coverThumb,
                    isVerified: userData.isVerified,
                    isPrivate: userData.isPrivate,
                    isPublic: userData.isPublic,
                    name: {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                    },
                    description: userData.description,
                    location: userData.location,
                    bio: userData.bio
                },

                // Statistics
                stats: {
                    posts: userData.statistics?.postCount || 0,
                    comments: userData.statistics?.commentCount || 0,
                    reactions: userData.statistics?.reactionCount || 0,
                    shares: userData.statistics?.shareCount || 0,
                    engagement: userData.statistics?.engagementScore || 0
                },

                // Account Status
                accountStatus: {
                    status: userData.accountStatus,
                    isLocked: userData.isAccountLocked,
                    isSuspended: userData.accountSuspended,
                    isDeleted: userData.isDeleted,
                    termsAccepted: userData.termsAccepted
                },

                // Personal Information
                personalInfo: userData.personalInformation?.[0] || null,

                // Preferences
                preferences: userData.preferences?.[0] || null
            }
        });

    } catch (err) {
        console.error('Get current user error:', err);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch user details");
    }
});

/**
 * @description Handles user logout
 * @param {Object} req - The request object containing user session data
 * @param {Object} res - The response object to send the response
 * @returns {Promise<void>}
 * 
 * @example
 *  defaultLogout(req, res);
 */
export const defaultLogout = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        // Clear auth cookies immediately
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        // Send success response immediately
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Logged out successfully'
        });

        // Perform non-blocking operations after sending response
        if (user) {
            const logoutTime = new Date();

            // Since we don't have session.loginTime, use a default or recent time
            // We'll use the current time minus 5 minutes as a reasonable default
            const estimatedLoginTime = new Date(logoutTime.getTime() - 5 * 60 * 1000);

            const logoutDetails = {
                time: logoutTime.toLocaleString(),
                device: req.get('user-agent') || 'unknown',
                location: 'Location data not available',
                ip: req.ip || 'unknown',
                loginTime: estimatedLoginTime,
                logoutTime: logoutTime
            };

            // Fire and forget - don't await these operations
            Promise.allSettled([
                // Create activity log
                prisma.userActivityLog.create({
                    data: {
                        userId: user.id,
                        activityType: 'LOGOUT',
                        description: 'User logged out successfully',
                        ipAddress: logoutDetails.ip,
                        userAgent: logoutDetails.device,
                        metadata: {
                            email: user.email,
                            logoutTime: logoutDetails.time
                        }
                    }
                }),

                // Send logout notification
                emailService.sendLogoutNotificationEmail(user, logoutDetails)
            ]).catch(error => {
                console.error('Background tasks error:', error);
                // Error in background tasks shouldn't affect the user experience
            });
        }
    } catch (error) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error?.message || 'Something went wrong while logging out');
    }
});
