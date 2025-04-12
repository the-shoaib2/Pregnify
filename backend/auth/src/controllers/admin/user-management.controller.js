import prisma from '../../utils/database/prisma.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import ApiResponse from '../../utils/error/api.response.js';
import ApiError from '../../utils/error/api.error.js';
import { generateUsername } from '../../utils/user/username.generator.js';
import { generateUserID } from '../../utils/user/userID.generator.js';
import { hashPassword, decryptPassword } from '../../utils/auth/auth.utils.js';
import { emailService } from '../../helpers/email/email_service.js';
import {
    ACCOUNT_EXPIRY_TIME,
    HTTP_STATUS
} from '../../constants/index.js';

import { USER_DEFINITIONS } from '../../constants/roles.constants.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

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

// Search User
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
        role: true,
        accountStatus: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(200).json(
        new ApiResponse(200, { found: false }, 'User not found')
      );
    }

    // Log admin activity
    if (req.user && req.user.id) {
      await prisma.userActivityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'FIND_USER',
          description: `Admin searched for user: ${email || username}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
    }

    return res.status(200).json(
      new ApiResponse(200, { found: true, user }, 'User found successfully')
    );
  } catch (error) {
    throw new ApiError(500, 'Failed to search user');
  }
});

// Create User
export const createUser = asyncHandler(async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      phoneNumber,
      role,
      gender,
      dateOfBirth,
      termsAccepted = false,
      description
    } = req.body;

    // Input validation
    if (!email?.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is required");
    }
    if (!firstName?.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "First name is required");
    }
    if (!lastName?.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Last name is required");
    }
    if (!password) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Password is required");
    }
    if (password !== confirmPassword) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Passwords do not match");
    }
    if (!termsAccepted) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Terms must be accepted");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid email format");
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
      );
    }

    // Phone number validation if provided
    if (phoneNumber) {
      // Remove all non-digit characters for validation
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Check if the cleaned number has at least 10 digits
      if (cleanPhoneNumber.length < 10) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Phone number must contain at least 10 digits");
      }
    }

    const normalizedRole = role.toUpperCase();

    // Role validation
    const validRoles = await getCachedOrFetch('validRoles', () =>
      Promise.resolve(Object.values(USER_DEFINITIONS)),
      3600000 // Cache for 1 hour
    );

    if (!validRoles.includes(normalizedRole)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid role provided");
    }

    // Date of birth validation
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

      // Check if user is at least 13 years old
      const age = new Date().getFullYear() - dateOfBirth.year;
      if (age < 13) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User must be at least 13 years old");
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
      prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } }),
      phoneNumber ? prisma.user.findUnique({ where: { phoneNumber }, select: { id: true } }) : Promise.resolve(null),
      normalizedRole === 'SUPER_ADMIN' ? prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' }, select: { id: true } }) : Promise.resolve(null),
      prisma.passwordPolicy.findUnique({ where: { id: 'default' }, select: { id: true } }),
      hashPassword(password),
      generateUsername(firstName, lastName),
      generateUserID(role),
      Promise.resolve(crypto.randomBytes(32).toString('hex'))
    ]);

    // Handle constraint validations
    if (existingEmailCheck) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Email already registered");
    }
    if (existingPhoneCheck) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Phone number already registered");
    }
    if (normalizedRole === 'SUPER_ADMIN' && existingSuperAdminCheck) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Super Admin account already exists");
    }
    if (!hashedPassword) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Password processing failed");
    }

    // Ensure default policy exists
    if (!defaultPolicyCheck) {
      await prisma.passwordPolicy.create({
        data: { id: 'default' } // Uses schema defaults
      });
    }

    // Prepare user data object
    const userData = {
      email: email.toLowerCase(),
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
      accountStatus: 'PENDING',
      
      // Personal Information
      personalInformation: {
        create: {
          firstName,
          lastName,
          genderIdentity: gender || null,
          dateOfBirth: parsedDateOfBirth,
          description: description || null
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

    // Create user with all relations in a single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user with all relations
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

      // Log admin activity
      if (req.user && req.user.id) {
        await tx.userActivityLog.create({
          data: {
            userId: req.user.id,
            activityType: "REGISTER",
            description: `Admin created new user: ${user.email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        });
      }

      return user;
    });

    // Send welcome email asynchronously
    process.nextTick(async () => {
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
    });

    // Return success response
    return res.status(201).json(
      new ApiResponse(201, {
        ...newUser,
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        accountStatus: newUser.accountStatus
      }, "User created successfully")
    );

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle Prisma-specific errors
    if (error.code) {
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          const field = error.meta?.target?.[0] || 'field';
          throw new ApiError(HTTP_STATUS.CONFLICT, `User with this ${field} already exists`);
        case 'P2025': // Record not found
          throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced record not found");
        case 'P2003': // Foreign key constraint failed
          throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid reference to a related record");
        default:
          console.error('Database error during user creation:', error);
          throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error occurred");
      }
    }

    console.error('User creation error:', error);
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create user");
  }
});

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 101, search, role, status } = req.query;

  const where = {
    // Exclude current user's account
    id: {
      not: req.user?.id
    }
  };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.accountStatus = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        lastLoginAt: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({ where })
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }, 'Users retrieved successfully')
  );
});

// Get User by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { includePassword } = req.query; // Optional query parameter to include password info

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      // Primary Identification
      id: true,
      userID: true,
      username: true,
      email: true,
      phoneNumber: true,
      password_hash: Boolean(includePassword), // Only include if specifically requested

      // User Details
      firstName: true,
      lastName: true,
      description: true,
      avatar: true,
      avatarThumb: true,
      bio: true,
      location: true,
      isPublic: true,

      // Account Status & Role
      role: true,
      accountStatus: true,
      isAccountLocked: true,
      failedLoginCount: true,
      isDeleted: true,
      accountSuspended: true,
      bannedUntil: true,

      // Verification Status
      isVerified: true,
      isEmailVerified: true,
      isSmsVerified: true,
      multiFactorAuth: true,

      // Security Settings
      twoFactorEnabled: true,
      isPasskeyEnabled: true,
      isMfaEnabled: true,

      // Password Reset Info
      passwordChangedAt: true,
      passwordResetToken: true,
      passwordResetExpires: true,

      // Activity & Metrics
      lastActive: true,
      totalLogins: true,
      totalVisits: true,
      totalTimeSpent: true,
      averageSessionTime: true,
      activeStatus: true,
      profileCompletionPercentage: true,

      // Timestamps
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      expiryDateAt: true,

      // Recent Activity
      activityLogs: {
        take: 10,
        orderBy: {
          timestamp: 'desc'
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if account is deleted
  if (user.isDeleted || user.accountStatus === 'DELETED') {
    throw new ApiError(404, 'User account has been deleted');
  }

  // Handle password information
  if (user.password_hash && includePassword === 'true') {
    // Return the bcrypt hash directly since we can't decrypt it
    // (bcrypt is a one-way hashing algorithm)
    user.password = user.password_hash;
  }

  // Remove sensitive password-related fields
  delete user.password_hash;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.passwordChangedAt;

  return res.status(200).json(
    new ApiResponse(200, user, 'User retrieved successfully')
  );
});

// Update User
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    role,
    gender,
    dateOfBirth,
    termsAccepted,
    description,
    accountStatus,
    password, // New password if provided
    currentPassword // Required if changing password
  } = req.body;

  // Find the user first
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password_hash: true,
      isDeleted: true,
      accountStatus: true
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if account is deleted
  if (user.isDeleted || user.accountStatus === 'DELETED') {
    throw new ApiError(404, 'User account has been deleted');
  }

  // Prepare update data
  const updateData = {
    firstName,
    lastName,
    phoneNumber,
    role,
    gender,
    dateOfBirth,
    termsAccepted,
    description,
    accountStatus
  };

  // Handle password update if provided
  if (password) {
    if (!currentPassword) {
      throw new ApiError(400, 'Current password is required to change password');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password_hash = hashedPassword;
    updateData.passwordChangedAt = new Date();
  }

  // Update user information
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      accountStatus: true,
      isVerified: true,
      isEmailVerified: true,
      isSmsVerified: true,
      updatedAt: true
    }
  });

  // Log admin activity
  if (req.user && req.user.id) {
    await prisma.userActivityLog.create({
      data: {
        userId: req.user.id,
        activityType: 'PROFILE_UPDATE',
        description: `Admin updated user: ${updatedUser.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, 'User updated successfully')
  );
});

// Update User Status
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { accountStatus, suspensionReason } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus,
      accountSuspended: accountStatus === 'SUSPENDED',
      bannedUntil: accountStatus === 'SUSPENDED' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    },
    select: {
      id: true,
      username: true,
      email: true,
      accountStatus: true,
      accountSuspended: true,
      bannedUntil: true,
      updatedAt: true
    }
  });

  // Log admin activity
  if (req.user && req.user.id) {
    await prisma.userActivityLog.create({
      data: {
        userId: req.user.id,
        activityType: 'UPDATE_USER_STATUS',
        description: `Admin updated user status: ${updatedUser.email} to ${accountStatus}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, 'User status updated successfully')
  );
});

// Delete User (Soft Delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const deletedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: 'DELETED',
      isDeleted: true,
      deletedAt: new Date()
    },
    select: {
      id: true,
      username: true,
      email: true,
      accountStatus: true,
      deletedAt: true
    }
  });

  // Log admin activity
  if (req.user && req.user.id) {
    await prisma.userActivityLog.create({
      data: {
        userId: req.user.id,
        activityType: 'CONTENT_DELETION',
        description: `Admin deleted user: ${deletedUser.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  }

  return res.status(200).json(
    new ApiResponse(200, deletedUser, 'User deleted successfully')
  );
}); 

// Get Users with Filters
export const getUsersWithFilters = asyncHandler(async (req, res) => {
  const {
    role,
    status,
    name,
    startDate,
    endDate,
    isVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  // Build where clause
  const where = {};

  // Filter by role
  if (role) {
    where.role = role;
  }

  // Filter by account status
  if (status) {
    where.accountStatus = status;
  }

  // Filter by name (search in firstName and lastName)
  if (name) {
    where.OR = [
      { firstName: { contains: name, mode: 'insensitive' } },
      { lastName: { contains: name, mode: 'insensitive' } },
      { username: { contains: name, mode: 'insensitive' } }
    ];
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // Filter by verification status
  if (isVerified !== undefined) {
    where.isVerified = isVerified === 'true';
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / limit);

  // Get users with filters
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      userID: true,
      username: true,
      email: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      role: true,
      accountStatus: true,
      isVerified: true,
      createdAt: true,
      lastLoginAt: true,
      profileCompletionPercentage: true,
      isAccountLocked: true,
      accountSuspended: true,
      bannedUntil: true
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip,
    take: Number(limit)
  });

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, 'Users retrieved successfully')
  );
});


// Get User Statistics
export const getUserStatistics = asyncHandler(async (req, res) => {
  const stats = await prisma.$transaction([
    // Total users count
    prisma.user.count(),
    // Active users in last 30 days
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    // Users by role
    prisma.user.groupBy({
      by: ['role'],
      _count: true
    }),
    // Users by status
    prisma.user.groupBy({
      by: ['accountStatus'],
      _count: true
    }),
    // Verified vs unverified users
    prisma.user.groupBy({
      by: ['isVerified'],
      _count: true
    }),
    // New users in last 7 days
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const [
    totalUsers,
    activeUsers,
    usersByRole,
    usersByStatus,
    usersByVerification,
    newUsers
  ] = stats;

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count;
        return acc;
      }, {}),
      usersByStatus: usersByStatus.reduce((acc, curr) => {
        acc[curr.accountStatus] = curr._count;
        return acc;
      }, {}),
      verificationStats: {
        verified: usersByVerification.find(x => x.isVerified)?._count || 0,
        unverified: usersByVerification.find(x => !x.isVerified)?._count || 0
      }
    }, 'User statistics retrieved successfully')
  );
});




// Get All User Activities
export const getAllActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100 } = req.query;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count and activities in parallel
  const [totalActivities, activities] = await Promise.all([
    prisma.userActivityLog.count(),
    prisma.userActivityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            accountStatus: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: Number(limit)
    })
  ]);

  // Format activities
  const formattedActivities = activities.map(activity => {
    // Handle case where user might not exist
    const userInfo = activity.user ? {
      id: activity.user.id,
      username: activity.user.username,
      email: activity.user.email,
      name: `${activity.user.firstName} ${activity.user.lastName}`,
      role: activity.user.role,
      status: activity.user.accountStatus
    } : null;

    return {
      id: activity.id,
      user: userInfo,
      action: activity.activityType,
      details: activity.description,
      ipAddress: activity.ipAddress || 'Unknown',
      status: activity.metadata?.status || 'completed',
      timestamp: activity.timestamp,
      userAgent: activity.userAgent || 'Unknown',
      location: activity.metadata?.location || 'Unknown',
      metadata: activity.metadata || {}
    };
  });

  // Format response
  const response = {
    activities: formattedActivities,
    pagination: {
      total: totalActivities,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalActivities / limit)
    }
  };

  return res.status(200).json(
    new ApiResponse(200, response, 'User activities retrieved successfully')
  );
});

// Get User Activities by User ID
export const getActivityByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 100 } = req.query;

  // First check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, accountStatus: true }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if account is deleted
  if (user.accountStatus === 'DELETED') {
    throw new ApiError(404, 'User account has been deleted');
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count and activities in parallel
  const [totalActivities, activities] = await Promise.all([
    prisma.userActivityLog.count({
      where: { userId }
    }),
    prisma.userActivityLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            accountStatus: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: Number(limit)
    })
  ]);

  // Format activities
  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    user: {
      id: activity.user.id,
      username: activity.user.username,
      email: activity.user.email,
      name: `${activity.user.firstName} ${activity.user.lastName}`,
      role: activity.user.role,
      status: activity.user.accountStatus
    },
    action: activity.activityType,
    details: activity.description,
    ipAddress: activity.ipAddress || 'Unknown',
    status: activity.metadata?.status || 'completed',
    timestamp: activity.timestamp,
    userAgent: activity.userAgent || 'Unknown',
    location: activity.metadata?.location || 'Unknown',
    metadata: activity.metadata || {}
  }));

  // Format response
  const response = {
    activities: formattedActivities,
    pagination: {
      total: totalActivities,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalActivities / limit)
    }
  };

  return res.status(200).json(
    new ApiResponse(200, response, 'User activities retrieved successfully')
  );
});

// Get User Activity by ID
export const getUserActivityById = asyncHandler(async (req, res) => {
  const { userId, activityId } = req.params;

  // First check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, accountStatus: true }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if account is deleted
  if (user.accountStatus === 'DELETED') {
    throw new ApiError(404, 'User account has been deleted');
  }

  // Find the specific activity
  const activity = await prisma.userActivityLog.findFirst({
    where: {
      id: activityId,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          accountStatus: true
        }
      }
    }
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  // Format activity
  const formattedActivity = {
    id: activity.id,
    user: {
      id: activity.user.id,
      username: activity.user.username,
      email: activity.user.email,
      name: `${activity.user.firstName} ${activity.user.lastName}`,
      role: activity.user.role,
      status: activity.user.accountStatus
    },
    action: activity.activityType,
    details: activity.description,
    ipAddress: activity.ipAddress || 'Unknown',
    status: activity.metadata?.status || 'completed',
    timestamp: activity.timestamp,
    userAgent: activity.userAgent || 'Unknown',
    location: activity.metadata?.location || 'Unknown',
    metadata: activity.metadata || {}
  };

  return res.status(200).json(
    new ApiResponse(200, formattedActivity, 'Activity retrieved successfully')
  );
});
