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

// Near the top of the file, add this caching utility
const cache = new Map();
const getCachedOrFetch = async (key, fetchFn, ttl = 60000) => {
    const now = Date.now();
    if (cache.has(key) && cache.get(key).expires > now) {
        return cache.get(key).data;
    }
    const data = await fetchFn();
    cache.set(key, { data, expires: now + ttl });
    return data;
};

/**
 * Sets authentication cookies for both access and refresh tokens
 * @description Sets secure HTTP-only cookies for authentication tokens with configurable expiry times.
 *              The cookies are secure in development and use strict same-site policy.
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
    const start = performance.now(); // For timing analysis
    try {
        const {
            role = "GUEST",
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

        // Quick validation checks - fail fast principle
        if (!email?.trim()) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is required");
        if (!firstName?.trim()) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "First name is required");
        if (!lastName?.trim()) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Last name is required");
        if (!password) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password is required");
        if (password !== confirmPassword) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Passwords do not match");
        if (!termsAccepted) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Terms must be accepted");

        const normalizedRole = role.toUpperCase();

        // Use cached role validation if available
        const validRoles = await getCachedOrFetch('validRoles', () =>
            Promise.resolve(Object.values(USER_DEFINITIONS)),
            3600000 // Cache for 1 hour
        );

        if (!validRoles.includes(normalizedRole)) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid role provided");
        }

        // Parse date of birth once
        let parsedDateOfBirth = null;
        if (dateOfBirth?.day && dateOfBirth?.month && dateOfBirth?.year) {
            parsedDateOfBirth = new Date(
                dateOfBirth.year,
                dateOfBirth.month - 1,
                dateOfBirth.day
            );

            if (isNaN(parsedDateOfBirth.getTime())) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid date of birth");
            }
        }

        // Start parallel operations for better performance
        const now = new Date();
        const verificationExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const expiryTime = typeof ACCOUNT_EXPIRY_TIME === 'number' ? ACCOUNT_EXPIRY_TIME : 30 * 24 * 60 * 60 * 1000;
        const expiryDateAt = new Date(now.getTime() + expiryTime);

        // Execute all database checks and preparations in parallel
        const [
            existingEmailCheck,
            existingPhoneCheck,
            existingSuperAdminCheck,
            defaultPolicyCheck,
            hashedPassword,
            username,
            userID,
            verificationToken
        ] = await Promise.all([
            prisma.user.findUnique({ where: { email }, select: { id: true } }),
            phoneNumber ? prisma.user.findUnique({ where: { phoneNumber }, select: { id: true } }) : Promise.resolve(null),
            normalizedRole === 'SUPER_ADMIN' ? prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' }, select: { id: true } }) : Promise.resolve(null),
            prisma.passwordPolicy.findUnique({ where: { id: 'default' }, select: { id: true } }),
            hashPassword(password),
            generateUsername(firstName, lastName),
            generateUserID(role),
            Promise.resolve(crypto.randomBytes(32).toString('hex'))
        ]);

        // Handle constraint validations
        if (existingEmailCheck) throw new ApiError(HTTP_STATUS.CONFLICT, "Email already registered");
        if (existingPhoneCheck) throw new ApiError(HTTP_STATUS.CONFLICT, "Phone number already registered");
        if (normalizedRole === 'SUPER_ADMIN' && existingSuperAdminCheck) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "Super Admin account already exists");
        }
        if (!hashedPassword) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Password processing failed");

        // Ensure default policy exists
        if (!defaultPolicyCheck) {
            await prisma.passwordPolicy.create({
                data: { id: 'default' } // Uses schema defaults
            });
        }

        // Prepare user data object
        const userData = {
            email,
            username,
            userID,
            password_hash: hashedPassword,
            firstName,
            lastName,
            phoneNumber: phoneNumber || null,
            role: normalizedRole,
            termsAccepted,
            isVerified: false,
            description: description || null,
            expiryDateAt,
            verificationToken,
            verificationExpires,
            
            // Personal Information
            personalInformation: {
                create: {
                    firstName,
                    lastName,
                    genderIdentity: gender || null,
                    dateOfBirth: parsedDateOfBirth,
                    description: description || null,
                    // Add default values for required fields
                    location: 'UNKNOWN',
                    education: 'UNKNOWN',
                    incomeLevel: 'UNKNOWN',
                    livingConditions: 'UNKNOWN',
                    accessToHealthcare: 'UNKNOWN',
                    maritalStatus: 'SINGLE',
                    citizenship: 'UNKNOWN',
                    occupation: {},
                    religion: 'PREFER_NOT_TO_SAY',
                    hobbies: [],
                    additionalInfo: {}
                }
            },

            // Medical Information
            medicalInformation: {
                create: {
                    bloodGroup: null,
                    organDonor: false,
                    height: null,
                    prePregnancyWeight: null,
                    currentWeight: null,
                    bmi: null,
                    bloodPressure: null,
                    medicalHistory: {},
                    chronicDiseases: {},
                    cancerHistory: false,
                    allergies: null,
                    medications: null,
                    vaccinationRecords: {},
                    geneticDisorders: {},
                    disabilities: {},
                    emergencyContact: null,
                    primaryPhysician: null
                }
            },

            // Preferences
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
            // Activity Log Settings
            activityLogSettings: {
                create: {
                    logFailedLogin: true,
                    logAccountChanges: true,
                    logProfileUpdates: true
                }
            },
            // Notification Preferences
            notificationPreferences: {
                create: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: false
                }
            },
            // Password Policy
            passwordPolicy: {
                connect: {
                    id: 'default'
                }
            }
        };

        // Optimized transaction
        const newUser = await prisma.$transaction(async (tx) => {
            // Create user with all relations in a single operation
            const user = await tx.user.create({ data: userData });

            // Create contact number if provided
            if (phoneNumber) {
                await tx.contactNumber.create({
                    data: {
                        userId: user.id,
                        number: phoneNumber,
                        isPrimary: true,
                        isVerified: false
                    }
                });
            }

            // Registration activity log
            await tx.userActivityLog.create({
                data: {
                    userId: user.id,
                    activityType: "REGISTER",
                    timestamp: now,
                    description: "New user registration"
                }
            });

            return user;
        }, {
            timeout: 8000, // Shorter timeout for faster failure
            isolationLevel: 'ReadCommitted', // Less restrictive isolation
            maxWait: 5000 // Max wait time for a connection
        });

        // Generate tokens in parallel with any other operations
        const tokens = await generateTokens(newUser);
        if (!tokens?.accessToken || !tokens?.refreshToken) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Token generation failed");
        }

        // Set authentication cookies
        setAuthCookies({
            res,
            tokens,
            accessTokenExpiry: ACCESS_TOKEN_EXPIRES,
            refreshTokenExpiry: REFRESH_TOKEN_EXPIRES
        });

        // Response Immediately 
        res.status(201).json({
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
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            }
        });



        // Performance metrics (development only)
        if (process.env.NODE_ENV === 'development') {
            const duration = performance.now() - start;
            console.log(`Registration completed in ${duration.toFixed(2)}ms`);
        }

        // Process background tasks after response is sent
        process.nextTick(() => {
            Promise.allSettled([

                // Send welcome email asynchronously
                (async () => {
                    try {
                        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
                        await emailService.sendWelcomeEmail(
                            newUser.email,
                            `${newUser.firstName} ${newUser.lastName}`,
                            verificationLink
                        );
                    } catch (emailError) {
                        console.error('Failed to send welcome email:', emailError);
                    }
                })()
            ]).catch(error => {
                console.error('Background task error:', error);
            });
        });

    } catch (err) {
        // Enhanced error handling with comprehensive error classification
        if (err instanceof ApiError) {
            throw err;
        }

        // Handle Prisma-specific errors with detailed messages
        if (err.code) {
            switch (err.code) {
                case 'P2002': // Unique constraint violation
                    const field = err.meta?.target?.[0] || 'field';
                    throw new ApiError(HTTP_STATUS.CONFLICT, `User with this ${field} already exists`);
                case 'P2025': // Record not found
                    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced record not found");
                case 'P2003': // Foreign key constraint failed
                    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid reference to a related record");
                case 'P2034': // Transaction timeout
                    throw new ApiError(HTTP_STATUS.REQUEST_TIMEOUT, "Registration timed out, please try again");
                default:
                    console.error('Database error during registration:', err);
                    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error occurred");
            }
        }

        console.error('Registration error:', err);
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
                isDeleted: true,
                accountStatus: true,
                role: true,
                isVerified: true,
                twoFactorEnabled: true
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        if (user.isDeleted || user.accountStatus === 'DELETED') {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User account has been deleted");
        }

        if (user.accountStatus === 'SUSPENDED') {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User account has been suspended");
        }

        if (user.accountStatus === 'BANNED') {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User account has been banned");
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
            secure: process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
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
