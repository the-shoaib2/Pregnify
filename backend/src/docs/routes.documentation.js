/**
 * API Routes Documentation
 * Base URL: /api/v1
 */

const routeDocumentation = {
    auth: {
        prefix: '/auth',
        routes: {
            register: {
                method: 'POST',
                path: '/register',
                description: 'Register a new user',
                body: {
                    email: 'string',
                    password: 'string',
                    username: 'string',
                    firstName: 'string',
                    lastName: 'string'
                }
            },
            login: {
                method: 'POST',
                path: '/login',
                description: 'Login user',
                body: {
                    email: 'string',
                    password: 'string'
                }
            },
            logout: {
                method: 'POST',
                path: '/logout',
                description: 'Logout user',
                requiresAuth: true
            },
            refreshToken: {
                method: 'POST',
                path: '/refresh-token',
                description: 'Get new access token using refresh token'
            },
            getCurrentUser: {
                method: 'GET',
                path: '/user',
                description: 'Get current user information',
                requiresAuth: true,
                response: {
                    success: 'boolean',
                    data: {
                        id: 'string',
                        email: 'string',
                        username: 'string',
                        firstName: 'string',
                        lastName: 'string',
                        role: 'string',
                        isVerified: 'boolean',
                        createdAt: 'date'
                    }
                }
            }
        }
    },

    verification: {
        prefix: '/verification',
        routes: {
            findUser: {
                method: 'POST',
                path: '/forgot-password/find-user',
                description: 'Find user for password reset',
                body: {
                    email: 'string (optional)',
                    username: 'string (optional)'
                }
            },
            sendCode: {
                method: 'POST',
                path: '/forgot-password/send-code',
                description: 'Send verification code',
                body: {
                    userId: 'string',
                    method: 'email | sms'
                }
            },
            verifyCode: {
                method: 'POST',
                path: '/forgot-password/verify-code',
                description: 'Verify reset code',
                body: {
                    userId: 'string',
                    code: 'string',
                    method: 'email | sms'
                }
            },
            resetPassword: {
                method: 'POST',
                path: '/forgot-password/reset-password',
                description: 'Reset password with token',
                body: {
                    token: 'string',
                    newPassword: 'string',
                    confirmPassword: 'string'
                }
            }
        }
    },

    twoFactor: {
        prefix: '/2fa',
        requiresAuth: true,
        routes: {
            setupTOTP: {
                method: 'POST',
                path: '/totp/setup',
                description: 'Setup TOTP 2FA'
            },
            verifyTOTP: {
                method: 'POST',
                path: '/totp/verify',
                description: 'Verify TOTP setup',
                body: {
                    code: 'string'
                }
            },
            setupSMS: {
                method: 'POST',
                path: '/sms/setup',
                description: 'Setup SMS 2FA',
                body: {
                    phoneNumber: 'string'
                }
            },
            verifySMS: {
                method: 'POST',
                path: '/sms/verify',
                description: 'Verify SMS setup',
                body: {
                    code: 'string'
                }
            },
            status: {
                method: 'GET',
                path: '/status',
                description: 'Get 2FA status'
            },
            disable: {
                method: 'DELETE',
                path: '/disable',
                description: 'Disable 2FA',
                body: {
                    password: 'string'
                }
            }
        }
    },

    account: {
        prefix: '/account',
        requiresAuth: true,
        routes: {
            profile: {
                method: 'GET',
                path: '/profile',
                description: 'Get complete user profile',
                response: {
                    success: 'boolean',
                    data: {
                        personalInfo: 'object',
                        education: 'array',
                        medicalInfo: 'object',
                        emergencyContacts: 'array'
                    }
                }
            },
            updatePersonalInfo: {
                method: 'PUT/PATCH',
                path: '/personal-info',
                description: 'Update personal information',
                body: {
                    firstName: 'string (optional)',
                    lastName: 'string (optional)',
                    phoneNumber: 'string (optional)',
                    dateOfBirth: 'ISO8601 date (optional)',
                    gender: 'enum (MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY) (optional)',
                    address: {
                        street: 'string (optional)',
                        city: 'string (optional)',
                        state: 'string (optional)',
                        country: 'string (optional)',
                        postalCode: 'string (optional)'
                    }
                }
            },
            updateEducation: {
                method: 'PATCH',
                path: '/education',
                description: 'Update education information'
            },
            updateMedicalInfo: {
                method: 'PATCH',
                path: '/medical-info',
                description: 'Update medical information'
            },
            settings: {
                method: 'GET',
                path: '/settings',
                description: 'Get account settings'
            },
            updateSettings: {
                method: 'PATCH',
                path: '/settings',
                description: 'Update account settings'
            },
            security: {
                method: 'PATCH',
                path: '/security',
                description: 'Update security settings'
            },
            activity: {
                method: 'GET',
                path: '/activity',
                description: 'Get activity logs'
            },
            delete: {
                method: 'DELETE',
                path: '/delete',
                description: 'Delete account'
            },
            getCurrentUser: {
                method: 'GET',
                path: '/user',
                description: 'Get current user account details',
                response: {
                    success: 'boolean',
                    data: {
                        id: 'string',
                        email: 'string',
                        username: 'string',
                        profile: 'object',
                        settings: 'object',
                        preferences: 'object'
                    }
                }
            }
        }
    },

    admin: {
        prefix: '/admin',
        requiresAuth: true,
        requiresRole: ['ADMIN', 'SUPER_ADMIN'],
        routes: {
            users: {
                method: 'GET',
                path: '/users',
                description: 'Get all users'
            },
            userById: {
                method: 'GET',
                path: '/users/:id',
                description: 'Get user by ID'
            },
            updateUser: {
                method: 'PATCH',
                path: '/users/:id',
                description: 'Update user'
            },
            deleteUser: {
                method: 'DELETE',
                path: '/users/:id',
                description: 'Delete user'
            },
            resetUserPassword: {
                method: 'POST',
                path: '/users/:id/reset-password',
                description: 'Reset user password'
            },
            sessions: {
                method: 'GET',
                path: '/users/:id/sessions',
                description: 'Get user sessions'
            },
            revokeSession: {
                method: 'POST',
                path: '/users/:id/sessions/:sessionId/revoke',
                description: 'Revoke user session'
            },
            auditLogs: {
                method: 'GET',
                path: '/audit-logs',
                description: 'Get audit logs'
            }
        }
    },

    media: {
        prefix: '/media',
        requiresAuth: true,
        routes: {
            profileImage: {
                method: 'POST',
                path: '/profile-image',
                description: 'Upload profile image'
            },
            cover: {
                method: 'POST',
                path: '/cover-image',
                description: 'Upload cover image'
            },
            document: {
                method: 'POST',
                path: '/document',
                description: 'Upload document'
            },
            albumImage: {
                method: 'POST',
                path: '/album/:albumId',
                description: 'Upload album image'
            },
            deleteImage: {
                method: 'DELETE',
                path: '/image/:imageId',
                description: 'Delete image'
            }
        }
    },

    health: {
        prefix: '/health',
        routes: {
            check: {
                method: 'GET',
                path: '/',
                description: 'Basic health check'
            },
            ping: {
                method: 'GET',
                path: '/ping',
                description: 'Simple ping endpoint'
            },
            status: {
                method: 'GET',
                path: '/status',
                description: 'Detailed system status'
            }
        }
    }
};

export default routeDocumentation; 