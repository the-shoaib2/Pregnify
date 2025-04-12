import prisma from '../../../utils/database/prisma.js';
import asyncHandler from '../../../utils/middleware/async.handler.js';
import ApiError from '../../../utils/error/api.error.js';
import { emailService } from '../../../helpers/email/email_service.js';
import { smsService } from '../../../helpers/sms/sms_service.js';
import { generateRandomString, hashPassword } from '../../../utils/crypto/crypto.utils.js';
import TwoFactorHandler from '../../../handlers/twofactor.handler.js';
import { HTTP_STATUS } from '../../../constants/index.js';

export const initiatePasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Return success even if user not found to prevent email enumeration
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, you will receive reset instructions."
        });
    }

    const resetToken = generateRandomString(32);
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordReset.create({
        data: {
            userId: user.id,
            token: resetToken,
            expiresAt: resetTokenExpiry
        }
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(resetLink);
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);

    res.status(200).json({
        success: true,
        message: "Password reset instructions sent to your email"
    });
});

export const verifyResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const resetRequest = await prisma.passwordReset.findFirst({
        where: {
            token,
            expiresAt: { gt: new Date() },
            used: false
        },
        include: { user: true }
    });

    if (!resetRequest) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    res.status(200).json({
        success: true,
        message: "Valid reset token",
        data: {
            email: resetRequest.user.email
        }
    });
});

export const verifyOTP = asyncHandler(async (req, res) => {
    const { userId, code, method } = req.body;
    const now = new Date();

    // Get verification and forgot password request from middleware
    const verification = req.verificationSession;
    const forgotPassword = req.forgotPassword;

    // Double-check expiration
    if (verification.expiresAt < now || forgotPassword.expiresAt < now) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Verification code has expired. Please request a new code.'
        );
    }

    try {
        // Use transaction to ensure data consistency
        const [updatedVerification] = await prisma.$transaction([
            // Mark current verification as used
            prisma.passwordResetVerification.update({
                where: { id: verification.id },
                data: { 
                    isUsed: true,
                    usedAt: now,
                    verifiedAt: now,
                    verified: true
                }
            }),
            // Invalidate any other verifications for this forgot password request
            prisma.passwordResetVerification.updateMany({
                where: {
                    forgotPasswordId: forgotPassword.id,
                    id: { not: verification.id },
                    isUsed: false
                },
                data: {
                    isUsed: true,
                    usedAt: now
                }
            })
        ]);

        // Add success details for activity log
        req.activityDetails = {
            verificationId: verification.id,
            method,
            success: true
        };

        // Return success with reset token
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Code verified successfully',
            data: {
                token: forgotPassword.token,
                expiresAt: forgotPassword.expiresAt
            }
        });
    } catch (error) {
        // Add error details for activity log
        req.activityDetails = {
            verificationId: verification.id,
            method,
            success: false,
            error: error.message
        };
        throw error;
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const now = new Date();

    // Find active forgot password request
    const forgotPassword = await prisma.forgotPassword.findFirst({
        where: {
            token,
            isRevoked: false,
            expiresAt: { gt: now }
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true
                }
            },
            verifications: {
                where: {
                    verified: true,
                    isUsed: true
                }
            }
        }
    });

    if (!forgotPassword) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Invalid or expired reset token'
        );
    }

    if (!forgotPassword.verifications.length) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'OTP verification required'
        );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark request as used
    await prisma.$transaction([
        // Update user password
        prisma.user.update({
            where: { id: forgotPassword.user.id },
            data: {
                password_hash: hashedPassword,
                updatedAt: now
            }
        }),
        // Mark forgot password request as used
        prisma.forgotPassword.update({
            where: { id: forgotPassword.id },
            data: {
                usedAt: now,
                isRevoked: true
            }
        }),
        // Create password history entry
        prisma.passwordHistory.create({
            data: {
                userId: forgotPassword.user.id,
                passwordHash: hashedPassword,
                createdAt: now,
                expiresAt: new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)), // 90 days
                isCurrent: true
            }
        }),
        // Invalidate all active sessions
        prisma.session.updateMany({
            where: { 
                userId: forgotPassword.user.id,
                isActive: true 
            },
            data: { 
                isActive: false,
                isRevoked: true
            }
        })
    ]);

    // Send password change notification
    await emailService.sendPasswordChangeNotification(
        forgotPassword.user.email,
        forgotPassword.user.firstName
    ).catch(error => {
        // Log the error but don't fail the password reset
        console.error('Failed to send password change notification:', error);
    });

    // Add success details for activity log
    req.activityDetails = {
        success: true,
        passwordReset: true
    };

    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successful. Please login with your new password.'
    });
});

export const recoverAccountWithSecurityQuestions = asyncHandler(async (req, res) => {
    const { email, answers } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { securityQuestions: true }
    });

    if (!user || !user.securityQuestions.length) {
        throw new ApiError(404, "Account not found or no security questions set");
    }

    // Verify security question answers
    const allAnswersCorrect = user.securityQuestions.every((question, index) => {
        return question.answer === answers[index];
    });

    if (!allAnswersCorrect) {
        throw new ApiError(400, "Incorrect answers to security questions");
    }

    // Generate recovery code
    await TwoFactorHandler.generateRecoveryEmail(user.id);

    res.status(200).json({
        success: true,
        message: "Recovery code sent to your email"
    });
});

export const recoverAccountWithTrustedDevice = asyncHandler(async (req, res) => {
    const { email, deviceId } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { trustedDevices: true }
    });

    if (!user) {
        throw new ApiError(404, "Account not found");
    }

    const isTrustedDevice = await TwoFactorHandler.verifyTrustedDevice(user.id, deviceId);
    if (!isTrustedDevice) {
        throw new ApiError(400, "Device not recognized as trusted");
    }

    // Generate and send recovery code
    await TwoFactorHandler.generateRecoveryEmail(user.id);

    res.status(200).json({
        success: true,
        message: "Recovery code sent to your email"
    });
});

export const findUser = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    try {
        // Find user without exposing sensitive data
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email?.toLowerCase() },
                    { username: username?.toLowerCase() }
                ],
                accountStatus: {
                    not: 'DELETED'
                }
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                twoFactorEnabled: true,
                isEmailVerified: true,
                isSmsVerified: true,
                avatar: true,
                forgotPasswords: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    select: {
                        id: true,
                        token: true,
                        isRevoked: true,
                        usedAt: true,
                        createdAt: true
                    }
                },
                securityQuestions: {
                    select: {
                        id: true,
                        question: true
                    }
                },
                trustedDevices: {
                    where: {
                        isRevoked: false,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    select: {
                        id: true,
                        deviceName: true,
                        lastUsed: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(HTTP_STATUS.OK).json({
                success: false,
                message: 'If an account exists with this email/username, you will receive further instructions.',
                data: {
                    found: false
                }
            });
        }

        // Set user ID in response locals for activity tracking
        res.locals.userId = user.id;

        // Check rate limiting for reset attempts
        const MAX_RESET_ATTEMPTS = 5;
        const RESET_ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

        const lastResetAttempt = user.forgotPasswords[0];
        if (lastResetAttempt?.isRevoked &&
            lastResetAttempt?.usedAt &&
            Date.now() - new Date(lastResetAttempt.usedAt).getTime() < RESET_ATTEMPT_WINDOW) {
            return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'Too many reset attempts. Please try again later.',
                data: {
                    found: true,
                    cooldown: true,
                    retryAfter: new Date(lastResetAttempt.usedAt.getTime() + RESET_ATTEMPT_WINDOW)
                }
            });
        }

        // Generate reset token
        const resetToken = generateRandomString(32);

        // Save reset token
        await prisma.forgotPassword.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                createdAt: new Date(),
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        });

        // Prepare recovery options and methods
        const recoveryMethods = {
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

        // Get default avatar if no custom avatar
        const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${user.firstName} ${user.lastName}`
        )}&background=random`;

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'User found',
            data: {
                found: true,
                userId: user.id,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`,
                avatar,
                maskedEmail: user.email.replace(/(?<=.{3}).(?=.*@)/g, '*'),
                maskedPhone: user.phoneNumber ? 
                    user.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2') : 
                    null,
                recoveryMethods,
                resetToken
            }
        });

    } catch (error) {
        console.error('Find user error:', error);
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Failed to process request'
        );
    }
});

function generateVerificationCode() {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendVerificationCode = asyncHandler(async (req, res) => {
    const { userId, method, type = 'code' } = req.body;
    const now = new Date();

    // Find user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            phoneNumber: true,
            firstName: true
        }
    });

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Generate verification code or reset token
    const code = type === 'code' ? 
        Math.floor(100000 + Math.random() * 900000).toString() :
        generateRandomString(32);
        
    // Set expiration to 1 minute from now
    const expiresAt = new Date(now.getTime() + 60 * 1000); // 1 minute

    try {
        // Create records in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // First create the forgot password record
            const forgotPassword = await prisma.forgotPassword.create({
                data: {
                    userId,
                    token: generateRandomString(32),
                    expiresAt: new Date(now.getTime() + 60 * 1000), // 1 minute
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                }
            });

            // Then create the verification record
            const verification = await prisma.passwordResetVerification.create({
                data: {
                    forgotPasswordId: forgotPassword.id,
                    code,
                    method,
                    type,
                    expiresAt
                }
            });

            return { forgotPassword, verification };
        });

        // Send verification code or link
        try {
            if (method === 'email') {
                if (type === 'link') {
                    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${code}`;
                    await emailService.sendPasswordResetLink(
                        user.email,
                        user.firstName,
                        resetLink,
                        { 
                            priority: 'high',
                            expiryMinutes: 1 // Pass expiry time to email template
                        }
                    );
                } else {
                    await emailService.sendPasswordResetCode(
                        user.email,
                        user.firstName,
                        code,
                        { 
                            priority: 'high',
                            expiryMinutes: 1 // Pass expiry time to email template
                        }
                    );
                }
            } else if (method === 'sms' && user.phoneNumber) {
                if (type !== 'code') {
                    throw new ApiError(
                        HTTP_STATUS.BAD_REQUEST,
                        'SMS only supports code verification'
                    );
                }
                await smsService.sendPasswordResetCode(
                    user.phoneNumber,
                    code,
                    1 // Pass expiry time in minutes
                );
            }
        } catch (error) {
            console.error('Communication error:', error);
            // Rollback by marking the verification as failed
            await prisma.passwordResetVerification.update({
                where: { id: result.verification.id },
                data: { 
                    verified: false,
                    isUsed: true,
                    usedAt: new Date(),
                    verifiedAt: new Date()
                }
            });
            throw new ApiError(
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                `Failed to send verification ${type}: ${error.message}`
            );
        }

        // Log the code/link in development
        if (process.env.NODE_ENV !== 'development') {
            console.log('Verification details:', {
                type,
                code,
                link: type === 'link' ? 
                    `${process.env.FRONTEND_URL}/reset-password?token=${code}` : 
                    undefined,
                expiresAt
            });
        }

        // Add success details for activity log
        req.activityDetails = {
            verificationId: result.verification.id,
            method,
            type,
            success: true,
            expiresAt
        };

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Verification ${type} sent successfully via ${method}`,
            data: {
                expiresAt,
                forgotPasswordId: result.forgotPassword.id,
                expiresIn: '1 minute'
            }
        });
    } catch (error) {
        console.error('Password reset error:', error);
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            `Failed to send verification ${type}: ${error.message}`
        );
    }
}); 