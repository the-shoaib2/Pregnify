-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `userID` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `passwordChangedAt` DATETIME(3) NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `verificationToken` VARCHAR(191) NULL,
    `verificationExpires` DATETIME(3) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `isSmsVerified` BOOLEAN NOT NULL DEFAULT false,
    `multiFactorAuth` BOOLEAN NOT NULL DEFAULT false,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `avatarThumb` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NULL,
    `coverThumb` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('GUEST', 'PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
    `accountStatus` ENUM('ACTIVE', 'INACTIVE', 'VERIFIED', 'DEACTIVATED', 'PENDING', 'SUSPENDED', 'DELETED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `isAccountLocked` BOOLEAN NOT NULL DEFAULT false,
    `failedLoginCount` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `termsAccepted` BOOLEAN NOT NULL DEFAULT false,
    `accountSuspended` BOOLEAN NOT NULL DEFAULT false,
    `bannedUntil` DATETIME(3) NULL,
    `darkModeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `languagePreference` VARCHAR(191) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `preferred_two_factor` VARCHAR(191) NULL,
    `last_two_factor_at` DATETIME(3) NULL,
    `two_factor_setup_at` DATETIME(3) NULL,
    `recoveryCode` VARCHAR(191) NULL,
    `is2FAVerified` BOOLEAN NOT NULL DEFAULT false,
    `reputationScore` INTEGER NOT NULL DEFAULT 0,
    `passwordPolicyId` VARCHAR(191) NOT NULL DEFAULT 'default',
    `isPasskeyEnabled` BOOLEAN NOT NULL DEFAULT false,
    `isMfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    `membershipTierId` VARCHAR(191) NULL,
    `totalReferralEarnings` DOUBLE NOT NULL DEFAULT 0.0,
    `recovery_contact_id` VARCHAR(191) NULL,
    `profileCompletionPercentage` INTEGER NOT NULL DEFAULT 0,
    `lastDeviceUsed` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `expiryDateAt` DATETIME(3) NULL,
    `lastActive` DATETIME(3) NULL,
    `totalLogins` INTEGER NOT NULL DEFAULT 0,
    `totalVisits` INTEGER NOT NULL DEFAULT 0,
    `totalTimeSpent` INTEGER NOT NULL DEFAULT 0,
    `averageSessionTime` DOUBLE NOT NULL DEFAULT 0,
    `activeStatus` ENUM('ONLINE', 'OFFLINE', 'AWAY', 'BUSY', 'INVISIBLE') NOT NULL DEFAULT 'OFFLINE',
    `postCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `reactionCount` INTEGER NOT NULL DEFAULT 0,
    `shareCount` INTEGER NOT NULL DEFAULT 0,
    `engagementScore` DOUBLE NOT NULL DEFAULT 0.0,
    `interactionRate` DOUBLE NOT NULL DEFAULT 0.0,
    `responseRate` DOUBLE NOT NULL DEFAULT 0.0,

    UNIQUE INDEX `users_userID_key`(`userID`),
    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `users_verificationToken_key`(`verificationToken`),
    INDEX `users_email_password_hash_idx`(`email`, `password_hash`),
    INDEX `users_username_password_hash_idx`(`username`, `password_hash`),
    INDEX `users_email_isAccountLocked_failedLoginCount_idx`(`email`, `isAccountLocked`, `failedLoginCount`),
    INDEX `users_username_isAccountLocked_failedLoginCount_idx`(`username`, `isAccountLocked`, `failedLoginCount`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_username_idx`(`username`),
    INDEX `users_userID_idx`(`userID`),
    INDEX `users_phoneNumber_idx`(`phoneNumber`),
    INDEX `users_isVerified_idx`(`isVerified`),
    INDEX `users_accountStatus_idx`(`accountStatus`),
    INDEX `users_email_accountStatus_idx`(`email`, `accountStatus`),
    INDEX `users_username_accountStatus_idx`(`username`, `accountStatus`),
    INDEX `users_phoneNumber_accountStatus_idx`(`phoneNumber`, `accountStatus`),
    INDEX `users_firstName_lastName_accountStatus_idx`(`firstName`, `lastName`, `accountStatus`),
    INDEX `users_isVerified_accountStatus_idx`(`isVerified`, `accountStatus`),
    INDEX `users_isEmailVerified_accountStatus_idx`(`isEmailVerified`, `accountStatus`),
    INDEX `users_isSmsVerified_accountStatus_idx`(`isSmsVerified`, `accountStatus`),
    INDEX `users_membershipTierId_idx`(`membershipTierId`),
    INDEX `users_passwordPolicyId_idx`(`passwordPolicyId`),
    INDEX `users_recovery_contact_id_idx`(`recovery_contact_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_information` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `nickName` VARCHAR(191) NULL,
    `genderIdentity` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `age` INTEGER NULL,
    `isDeceased` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `placeOfBirth` VARCHAR(191) NULL,
    `countryOfBirth` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `incomeLevel` VARCHAR(191) NULL,
    `livingConditions` VARCHAR(191) NULL,
    `accessToHealthcare` VARCHAR(191) NULL,
    `passportNumber` VARCHAR(191) NULL,
    `passportExpiry` DATETIME(3) NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER') NULL,
    `citizenship` VARCHAR(191) NULL,
    `occupation` JSON NULL,
    `religion` ENUM('ISLAM', 'CHRISTIANITY', 'HINDUISM', 'BUDDHISM', 'JUDAISM', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `hobbies` JSON NULL,
    `additionalInfo` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `personal_information_userId_key`(`userId`),
    INDEX `personal_information_userId_idx`(`userId`),
    INDEX `personal_information_userId_isDeceased_idx`(`userId`, `isDeceased`),
    INDEX `personal_information_userId_firstName_lastName_idx`(`userId`, `firstName`, `lastName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_numbers` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `contact_numbers_number_key`(`number`),
    INDEX `contact_numbers_userId_idx`(`userId`),
    INDEX `contact_numbers_number_idx`(`number`),
    INDEX `contact_numbers_isPrimary_idx`(`isPrimary`),
    INDEX `contact_numbers_isVerified_idx`(`isVerified`),
    INDEX `contact_numbers_userId_isPrimary_idx`(`userId`, `isPrimary`),
    INDEX `contact_numbers_userId_isVerified_idx`(`userId`, `isVerified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('CURRENT', 'PRESENT', 'PERMANENT', 'WORK', 'HOME', 'OFFICE', 'OTHER') NOT NULL,
    `details` JSON NOT NULL,

    INDEX `addresses_userId_idx`(`userId`),
    INDEX `addresses_type_idx`(`type`),
    INDEX `addresses_userId_type_idx`(`userId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `websites` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `category` ENUM('SOCIAL', 'WORK', 'LEARNING', 'FINANCE', 'SPORTS', 'HEALTH', 'ENTERTAINMENT', 'ECOMMERCE', 'GOVERNMENT', 'PERSONAL', 'OTHER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,

    UNIQUE INDEX `websites_url_key`(`url`),
    INDEX `websites_userId_idx`(`userId`),
    INDEX `websites_url_idx`(`url`),
    INDEX `websites_userId_url_idx`(`userId`, `url`),
    INDEX `websites_userId_category_idx`(`userId`, `category`),
    INDEX `websites_userId_category_url_idx`(`userId`, `category`, `url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `education_qualifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NULL,
    `fieldOfStudy` VARCHAR(191) NULL,
    `qualification` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `startYear` INTEGER NULL,
    `endYear` INTEGER NULL,
    `isOngoing` BOOLEAN NOT NULL DEFAULT false,
    `gpa` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `education_qualifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_information` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bloodGroup` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN') NULL,
    `organDonor` BOOLEAN NOT NULL DEFAULT false,
    `height` DOUBLE NULL,
    `prePregnancyWeight` DOUBLE NULL,
    `currentWeight` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `bloodPressure` VARCHAR(191) NULL,
    `medicalHistory` JSON NULL,
    `chronicDiseases` JSON NULL,
    `cancerHistory` BOOLEAN NOT NULL DEFAULT false,
    `cancerType` VARCHAR(191) NULL,
    `allergies` VARCHAR(191) NULL,
    `medications` VARCHAR(191) NULL,
    `vaccinationRecords` JSON NULL,
    `geneticDisorders` JSON NULL,
    `disabilities` JSON NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `primaryPhysician` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `medical_information_userId_key`(`userId`),
    INDEX `medical_information_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_report` (
    `id` VARCHAR(191) NOT NULL,
    `medicalInfoId` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `reportDate` DATETIME(3) NOT NULL,
    `reportDetails` JSON NULL,
    `doctorId` VARCHAR(191) NULL,
    `fileId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medical_report_medicalInfoId_idx`(`medicalInfoId`),
    INDEX `medical_report_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescription` (
    `id` VARCHAR(191) NOT NULL,
    `medicalInfoId` VARCHAR(191) NOT NULL,
    `medicationName` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `doctorId` VARCHAR(191) NULL,
    `pharmacy` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `refillCount` INTEGER NOT NULL DEFAULT 0,
    `refillDate` DATETIME(3) NULL,
    `fileId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `prescription_medicalInfoId_idx`(`medicalInfoId`),
    INDEX `prescription_fileId_idx`(`fileId`),
    INDEX `prescription_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `preferences` JSON NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `notifications` JSON NULL,
    `settings` JSON NULL,
    `customization` JSON NULL,
    `theme` ENUM('LIGHT', 'DARK', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    `language` ENUM('EN', 'BN', 'AR', 'ES', 'FR', 'DE', 'IT', 'PT', 'ZH') NOT NULL DEFAULT 'EN',
    `dateFormat` VARCHAR(191) NULL,
    `timeFormat` VARCHAR(191) NULL,
    `currency` ENUM('USD', 'BDT', 'GBP', 'AUD', 'CAD', 'CNY', 'JPY', 'KRW', 'NZD', 'SGD', 'ZAR', 'INR', 'TRY') NOT NULL DEFAULT 'USD',
    `notificationTone` VARCHAR(191) NULL,
    `isEmailEnabled` BOOLEAN NOT NULL DEFAULT true,
    `isSmsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `emailFrequency` VARCHAR(191) NULL,
    `isTwoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `privacySettings` JSON NULL,
    `securityQuestions` JSON NULL,
    `isDarkModeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `fontSize` VARCHAR(191) NULL,
    `highContrastMode` BOOLEAN NOT NULL DEFAULT false,
    `billingAddress` VARCHAR(191) NULL,
    `paymentMethod` ENUM('CARD', 'MOBILE_PAYMENT', 'BANK_TRANSFER', 'CASH', 'CRYPTO', 'OTHER') NULL,
    `subscriptionPlan` ENUM('BASIC', 'PREMIUM', 'GOLD') NOT NULL DEFAULT 'BASIC',
    `isAutoRenewEnabled` BOOLEAN NOT NULL DEFAULT false,
    `contentFilters` JSON NULL,
    `adPersonalization` BOOLEAN NOT NULL DEFAULT true,
    `contentLanguage` ENUM('EN', 'BN', 'AR', 'ES', 'FR', 'DE', 'IT', 'PT', 'ZH') NOT NULL DEFAULT 'EN',
    `timezone` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `account_preferences_userId_key`(`userId`),
    INDEX `account_preferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `smsNotifications` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notification_preferences_userId_key`(`userId`),
    INDEX `notification_preferences_emailNotifications_idx`(`emailNotifications`),
    INDEX `notification_preferences_pushNotifications_idx`(`pushNotifications`),
    INDEX `notification_preferences_smsNotifications_idx`(`smsNotifications`),
    INDEX `notification_preferences_createdAt_idx`(`createdAt`),
    INDEX `notification_preferences_userId_emailNotifications_idx`(`userId`, `emailNotifications`),
    INDEX `notification_preferences_userId_pushNotifications_idx`(`userId`, `pushNotifications`),
    INDEX `notification_preferences_userId_smsNotifications_idx`(`userId`, `smsNotifications`),
    INDEX `notification_preferences_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `notification_preferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ip_whitelist` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ip_whitelist_userId_idx`(`userId`),
    UNIQUE INDEX `ip_whitelist_userId_ipAddress_key`(`userId`, `ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_history` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `macAddress` VARCHAR(191) NULL,
    `deviceType` ENUM('WEB', 'DESKTOP', 'MOBILE', 'TABLET', 'OTHER') NULL,
    `loginAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `logoutAt` DATETIME(3) NULL,
    `sessionDuration` INTEGER NULL,
    `successful` BOOLEAN NOT NULL DEFAULT true,
    `failureReason` VARCHAR(191) NULL,
    `metadata` JSON NULL,

    INDEX `login_history_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trusted_devices` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `device_id` VARCHAR(191) NOT NULL,
    `device_name` VARCHAR(191) NOT NULL,
    `device_type` VARCHAR(191) NULL,
    `last_used` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `revoked_at` DATETIME(3) NULL,

    UNIQUE INDEX `trusted_devices_user_id_device_id_key`(`user_id`, `device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `two_factor_auth` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `secret` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_used_at` DATETIME(3) NULL,
    `verification_code` VARCHAR(191) NULL,
    `verification_code_expiry` DATETIME(3) NULL,

    INDEX `two_factor_auth_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_codes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backup_codes_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `two_factor_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `isValid` BOOLEAN NOT NULL DEFAULT true,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `used_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,

    UNIQUE INDEX `two_factor_sessions_token_key`(`token`),
    INDEX `two_factor_sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_log_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `logFailedLogin` BOOLEAN NOT NULL DEFAULT true,
    `logAccountChanges` BOOLEAN NOT NULL DEFAULT true,
    `logProfileUpdates` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `activity_log_settings_userId_key`(`userId`),
    INDEX `activity_log_settings_userId_idx`(`userId`),
    INDEX `activity_log_settings_logFailedLogin_idx`(`logFailedLogin`),
    INDEX `activity_log_settings_logAccountChanges_idx`(`logAccountChanges`),
    INDEX `activity_log_settings_logProfileUpdates_idx`(`logProfileUpdates`),
    INDEX `activity_log_settings_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activityType` ENUM('REGISTER', 'REGISTER_SUCCESS', 'REGISTER_FAILED', 'LOGIN', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_SUCCESS', 'LOGOUT_FAILED', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'SECURITY_SETTING_CHANGE', 'ACCOUNT_DEACTIVATION', 'ACCOUNT_REACTIVATION', 'CONTENT_CREATION', 'CONTENT_DELETION', 'CONTENT_UPDATE', 'FRIEND_REQUEST', 'MESSAGE_SEND', 'FILE_UPLOAD', 'PAYMENT_MADE', 'SUBSCRIPTION_CHANGE', 'NOTIFICATION_SETTINGS_UPDATE', 'PRIVACY_SETTINGS_UPDATE', 'TWO_FACTOR_TOGGLE', 'DEVICE_ADDED', 'DEVICE_REMOVED', 'API_ACCESS', 'REPORT_GENERATION', 'FEEDBACK_SUBMISSION', 'GET_CURRENT_USER', 'GET_CURRENT_USER_FAILED', 'GET_USER_PROFILE', 'UPDATE_USER_PROFILE', 'DELETE_USER_PROFILE', 'USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILED', 'USER_LOGOUT_SUCCESS', 'USER_LOGOUT_FAILED', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_FAILED', 'EMAIL_VERIFICATION_SENT', 'EMAIL_VERIFICATION_SUCCESS', 'EMAIL_VERIFICATION_FAILED', 'PHONE_VERIFICATION_SENT', 'PHONE_VERIFICATION_SUCCESS', 'PHONE_VERIFICATION_FAILED', 'TWO_FACTOR_SETUP', 'TWO_FACTOR_VERIFICATION', 'ACCOUNT_SETTINGS_UPDATE', 'PROFILE_PICTURE_UPDATE', 'USER_SESSION_START', 'USER_SESSION_END', 'USER_DATA_EXPORT', 'USER_DATA_DELETE', 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'SECURITY_ALERT', 'ACCOUNT_RECOVERY', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELLED', 'PAYMENT_PROCESSED', 'PAYMENT_FAILED', 'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'EMERGENCY_CONTACT_ADDED', 'EMERGENCY_CONTACT_REMOVED', 'FEEDBACK_SUBMITTED', 'REPORT_DOWNLOADED', 'SETTINGS_CHANGED', 'NOTIFICATION_SENT', 'ACCOUNT_LINKED', 'ACCOUNT_UNLINKED', 'ROLE_ASSIGNED', 'ROLE_REMOVED', 'MEMBERSHIP_UPGRADED', 'MEMBERSHIP_DOWNGRADED', 'ACTIVITY_DATA_EXPORT') NOT NULL,
    `description` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON NULL,

    INDEX `UserActivityLog_userId_idx`(`userId`),
    INDEX `UserActivityLog_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Badges` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Badges_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Forum_Post` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Forum_Post_userId_idx`(`userId`),
    INDEX `Forum_Post_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Forum_Comment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Forum_Comment_userId_idx`(`userId`),
    INDEX `Forum_Comment_postId_idx`(`postId`),
    INDEX `Forum_Comment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFollows` (
    `id` VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserFollows_followerId_idx`(`followerId`),
    INDEX `UserFollows_followingId_idx`(`followingId`),
    UNIQUE INDEX `UserFollows_followerId_followingId_key`(`followerId`, `followingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Forum_Reply` (
    `id` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reply` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Forum_Reply_userId_idx`(`userId`),
    INDEX `Forum_Reply_commentId_idx`(`commentId`),
    INDEX `Forum_Reply_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Referral` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `referredBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Referral_userId_idx`(`userId`),
    INDEX `Referral_referredBy_idx`(`referredBy`),
    INDEX `Referral_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `deviceId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `accessTokenCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `refreshTokenCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accessTokenUpdatedAt` DATETIME(3) NOT NULL,
    `refreshTokenUpdatedAt` DATETIME(3) NOT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Sessions_accessToken_key`(`accessToken`),
    UNIQUE INDEX `Sessions_refreshToken_key`(`refreshToken`),
    INDEX `Sessions_userId_refreshToken_refreshTokenExpiresAt_isRevoked_idx`(`userId`, `refreshToken`, `refreshTokenExpiresAt`, `isRevoked`, `isExpired`),
    INDEX `Sessions_userId_accessToken_accessTokenExpiresAt_isRevoked_i_idx`(`userId`, `accessToken`, `accessTokenExpiresAt`, `isRevoked`, `isExpired`),
    INDEX `Sessions_userId_deviceId_isActive_idx`(`userId`, `deviceId`, `isActive`),
    INDEX `Sessions_refreshToken_idx`(`refreshToken`),
    INDEX `Sessions_accessToken_idx`(`accessToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `API_keys` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `API_keys_key_key`(`key`),
    INDEX `API_keys_userId_isRevoked_expiresAt_idx`(`userId`, `isRevoked`, `expiresAt`),
    INDEX `API_keys_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OAuth_Credentials` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('GOOGLE', 'GITHUB', 'APPLE', 'MICROSOFT', 'FACEBOOK', 'LINKEDIN', 'DISCORD', 'SPOTIFY', 'CREDENTIALS', 'OAUTH', 'OTHER', 'DEFAULT_REGISTER') NOT NULL,
    `providerUserId` VARCHAR(191) NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `scopes` VARCHAR(191) NOT NULL DEFAULT '',
    `tokenType` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,

    UNIQUE INDEX `OAuth_Credentials_accessToken_key`(`accessToken`),
    UNIQUE INDEX `OAuth_Credentials_refreshToken_key`(`refreshToken`),
    INDEX `OAuth_Credentials_userId_provider_isRevoked_idx`(`userId`, `provider`, `isRevoked`),
    INDEX `OAuth_Credentials_accessToken_expiresAt_idx`(`accessToken`, `expiresAt`),
    INDEX `OAuth_Credentials_providerUserId_idx`(`providerUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Linked_Accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('GOOGLE', 'GITHUB', 'APPLE', 'MICROSOFT', 'FACEBOOK', 'LINKEDIN', 'DISCORD', 'SPOTIFY', 'CREDENTIALS', 'OAUTH', 'OTHER', 'DEFAULT_REGISTER') NOT NULL,
    `providerUserId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `scopes` VARCHAR(191) NOT NULL DEFAULT '',
    `accountEmail` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NULL,
    `profileUrl` VARCHAR(191) NULL,
    `pictureUrl` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastSyncedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Linked_Accounts_providerUserId_key`(`providerUserId`),
    UNIQUE INDEX `Linked_Accounts_accessToken_key`(`accessToken`),
    UNIQUE INDEX `Linked_Accounts_refreshToken_key`(`refreshToken`),
    INDEX `Linked_Accounts_userId_provider_isRevoked_idx`(`userId`, `provider`, `isRevoked`),
    INDEX `Linked_Accounts_providerUserId_idx`(`providerUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordPolicy` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `minLength` INTEGER NOT NULL DEFAULT 12,
    `maxLength` INTEGER NOT NULL DEFAULT 64,
    `requireUppercase` BOOLEAN NOT NULL DEFAULT true,
    `requireLowercase` BOOLEAN NOT NULL DEFAULT true,
    `requireNumbers` BOOLEAN NOT NULL DEFAULT true,
    `requireSpecialChars` BOOLEAN NOT NULL DEFAULT true,
    `specialCharsList` VARCHAR(191) NOT NULL DEFAULT '!@#$%^&*()_+-=[]{}|;:,.<>?',
    `maxPasswordAge` INTEGER NOT NULL DEFAULT 90,
    `minPasswordAge` INTEGER NOT NULL DEFAULT 1,
    `preventReusedPasswords` INTEGER NOT NULL DEFAULT 5,
    `lockoutThreshold` INTEGER NOT NULL DEFAULT 5,
    `lockoutDuration` INTEGER NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_history` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `wasCompromised` BOOLEAN NOT NULL DEFAULT false,

    INDEX `password_history_userId_idx`(`userId`),
    INDEX `password_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_activity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('FIND_USER', 'SEND_CODE', 'VERIFY_CODE', 'RESET_PASSWORD', 'UNKNOWN') NOT NULL,
    `status` ENUM('INITIATED', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELED', 'PROCESSING') NOT NULL DEFAULT 'INITIATED',
    `initiatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `deviceType` ENUM('WEB', 'DESKTOP', 'MOBILE', 'TABLET', 'OTHER') NULL,
    `otpSentAt` DATETIME(3) NULL,
    `otpVerifiedAt` DATETIME(3) NULL,
    `otpAttempts` INTEGER NOT NULL DEFAULT 0,
    `otpExpiresAt` DATETIME(3) NULL,
    `deviceInfo` JSON NULL,
    `location` JSON NULL,
    `details` JSON NULL,
    `resetMethod` ENUM('EMAIL', 'SMS', 'AUTHENTICATOR_APP', 'BACKUP_CODES', 'ADMIN_RESET') NULL,
    `isFromTrustedDevice` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `password_reset_activity_userId_idx`(`userId`),
    INDEX `password_reset_activity_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_security_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `eventType` ENUM('PASSWORD_CHANGED', 'PASSWORD_RESET', 'FAILED_ATTEMPT', 'LOCKOUT', 'COMPROMISED_DETECTED', 'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `deviceInfo` JSON NULL,
    `location` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `password_security_logs_userId_idx`(`userId`),
    INDEX `password_security_logs_eventType_idx`(`eventType`),
    INDEX `password_security_logs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forgot_passwords` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `forgot_passwords_token_key`(`token`),
    INDEX `forgot_passwords_userId_idx`(`userId`),
    INDEX `forgot_passwords_expiresAt_idx`(`expiresAt`),
    INDEX `forgot_passwords_userId_isRevoked_expiresAt_idx`(`userId`, `isRevoked`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `forgotPasswordId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'code',
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `password_reset_verifications_forgotPasswordId_idx`(`forgotPasswordId`),
    INDEX `password_reset_verifications_forgotPasswordId_verified_idx`(`forgotPasswordId`, `verified`),
    INDEX `password_reset_verifications_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_attempts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `success` BOOLEAN NOT NULL DEFAULT false,

    INDEX `login_attempts_userId_idx`(`userId`),
    INDEX `login_attempts_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passkeys` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `credentialID` VARCHAR(191) NOT NULL,
    `credentialPublicKey` TEXT NOT NULL,
    `counter` BIGINT NOT NULL,
    `transports` JSON NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `passkeys_credentialID_key`(`credentialID`),
    INDEX `passkeys_userId_idx`(`userId`),
    INDEX `passkeys_lastUsedAt_idx`(`lastUsedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webauthn_challenges` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `challenge` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `webauthn_challenges_userId_idx`(`userId`),
    INDEX `webauthn_challenges_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `multi_factor_methods` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `method` ENUM('TOTP', 'SMS', 'EMAIL', 'HARDWARE') NOT NULL,
    `secret` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `tokenExpires` DATETIME(3) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,

    INDEX `multi_factor_methods_userId_idx`(`userId`),
    INDEX `multi_factor_methods_lastUsedAt_idx`(`lastUsedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `user_role_assignments_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership_tiers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL DEFAULT 0.0,
    `features` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `membership_tiers_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_cards` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cardNumber` VARCHAR(191) NOT NULL,
    `cardHolder` VARCHAR(191) NOT NULL,
    `cvvHash` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_cards_cardNumber_key`(`cardNumber`),
    INDEX `payment_cards_userId_idx`(`userId`),
    UNIQUE INDEX `payment_cards_userId_cardNumber_key`(`userId`, `cardNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` ENUM('USD', 'BDT', 'GBP', 'AUD', 'CAD', 'CNY', 'JPY', 'KRW', 'NZD', 'SGD', 'ZAR', 'INR', 'TRY') NOT NULL DEFAULT 'BDT',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PROCESSING', 'SUCCESS') NOT NULL DEFAULT 'PENDING',
    `method` ENUM('CARD', 'MOBILE_PAYMENT', 'BANK_TRANSFER', 'CASH', 'CRYPTO', 'OTHER') NOT NULL,
    `gateway` ENUM('STRIPE', 'PAYPAL', 'BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'MASTERCARD', 'VISA', 'AMERICAN_EXPRESS', 'PAYONEER', 'GOOGLE_PAY', 'APPLE_PAY', 'CRYPTO', 'OTHER') NULL,
    `transactionId` VARCHAR(191) NULL,
    `stripeId` VARCHAR(191) NULL,
    `bkashId` VARCHAR(191) NULL,
    `nagadId` VARCHAR(191) NULL,
    `refunded` BOOLEAN NOT NULL DEFAULT false,
    `refundId` VARCHAR(191) NULL,
    `failureReason` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `payments_transactionId_key`(`transactionId`),
    UNIQUE INDEX `payments_stripeId_key`(`stripeId`),
    UNIQUE INDEX `payments_bkashId_key`(`bkashId`),
    UNIQUE INDEX `payments_nagadId_key`(`nagadId`),
    UNIQUE INDEX `payments_refundId_key`(`refundId`),
    INDEX `payments_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `reason` VARCHAR(191) NULL,
    `refundedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `refunds_paymentId_key`(`paymentId`),
    INDEX `refunds_paymentId_idx`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    `status` ENUM('ACTIVE', 'PENDING', 'CANCELED', 'EXPIRED', 'TRIAL') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `trialEndsAt` DATETIME(3) NULL,
    `discount` DOUBLE NULL,
    `autoRenew` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `subscriptions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_bonus` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `referredBy` VARCHAR(191) NULL,
    `bonusAmount` DOUBLE NOT NULL DEFAULT 50.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `referral_bonus_userId_referredBy_idx`(`userId`, `referredBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recovery_contact` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('EMAIL', 'PHONE', 'ALTERNATE_EMAIL', 'ALTERNATE_PHONE', 'OTHER') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recovery_contact_userId_key`(`userId`),
    UNIQUE INDEX `recovery_contact_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `usedSpace` BIGINT NOT NULL DEFAULT 0,
    `maxSpace` BIGINT NOT NULL DEFAULT 1073741824,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `storage_userId_key`(`userId`),
    INDEX `storage_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileType` ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'PDF', 'SPREADSHEET', 'PRESENTATION', 'ARCHIVE', 'CODE', 'OTHER') NOT NULL DEFAULT 'IMAGE',
    `fileCategory` ENUM('GENERAL', 'PROFILE', 'COVER', 'POST', 'DOCUMENT', 'AVATAR', 'GALLERY', 'OTHER', 'MEDICAL', 'MEDICAL_REPORT', 'VIDEO', 'AUDIO', 'ARCHIVE', 'SPREADSHEET', 'PRESENTATION', 'TEXT', 'CODE', 'DATABASE', 'SYSTEM', 'FONT', 'DESIGN', 'TEMPORARY', 'BACKUP', 'CONFIG', 'LOG', 'CERTIFICATE', 'SCRIPT', 'STREAMING', 'SENSOR', 'AI_GENERATED', 'ENCRYPTED', 'BLOCKCHAIN', 'METADATA', 'ANNOTATION', 'EPHEMERAL', 'ANALYTICS') NOT NULL DEFAULT 'GALLERY',
    `documentType` ENUM('PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'JSON', 'HTML', 'CSS', 'JS', 'XML', 'ZIP', 'RAR', 'SEVENZ', 'JPG', 'JPEG', 'HEIC', 'HEIF', 'TIFF', 'PNG', 'GIF', 'WEBP', 'SVG', 'MP4', 'WEBM', 'MP3', 'WAV', 'OTHER') NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TEMPORARY',
    `confirmedAt` DATETIME(3) NULL,
    `url` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE', 'FRIENDS', 'CUSTOM') NOT NULL DEFAULT 'PRIVATE',
    `size` BIGINT NOT NULL,
    `format` VARCHAR(191) NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration` DOUBLE NULL,
    `cloudinaryId` VARCHAR(191) NULL,
    `cloudinaryData` JSON NULL,
    `allowComments` BOOLEAN NOT NULL DEFAULT true,
    `allowSharing` BOOLEAN NOT NULL DEFAULT true,
    `allowDownload` BOOLEAN NOT NULL DEFAULT true,
    `customAudience` VARCHAR(191) NULL,
    `privacySettings` JSON NULL,
    `metadata` JSON NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `reactionCount` INTEGER NOT NULL DEFAULT 0,
    `shareCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `editedAt` DATETIME(3) NULL,

    INDEX `files_id_idx`(`id`),
    INDEX `files_userId_idx`(`userId`),
    INDEX `files_fileType_idx`(`fileType`),
    INDEX `files_fileCategory_idx`(`fileCategory`),
    INDEX `files_cloudinaryId_idx`(`cloudinaryId`),
    INDEX `files_userId_status_visibility_idx`(`userId`, `status`, `visibility`),
    INDEX `files_userId_status_fileCategory_idx`(`userId`, `status`, `fileCategory`),
    INDEX `files_userId_status_createdAt_idx`(`userId`, `status`, `createdAt`),
    INDEX `files_title_description_idx`(`title`, `description`),
    INDEX `files_userId_fileType_idx`(`userId`, `fileType`),
    INDEX `files_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `files_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shares` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `sharedBy` VARCHAR(191) NOT NULL,
    `sharedWith` VARCHAR(191) NOT NULL,
    `shareType` ENUM('DIRECT', 'GROUP', 'LINK', 'TEMPORARY', 'RESTRICTED') NOT NULL DEFAULT 'DIRECT',
    `message` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE', 'FRIENDS', 'CUSTOM') NOT NULL DEFAULT 'PRIVATE',
    `permissions` JSON NULL,
    `expiresAt` DATETIME(3) NULL,
    `sharedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `viewedAt` DATETIME(3) NULL,

    INDEX `shares_fileId_idx`(`fileId`),
    INDEX `shares_sharedBy_idx`(`sharedBy`),
    INDEX `shares_sharedWith_idx`(`sharedWith`),
    UNIQUE INDEX `shares_fileId_sharedWith_key`(`fileId`, `sharedWith`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE', 'FRIENDS', 'CUSTOM') NOT NULL DEFAULT 'PRIVATE',
    `coverFile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `collections_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `albums` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `coverFile` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `albums_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `imageId` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `comments_imageId_idx`(`imageId`),
    INDEX `comments_fileId_idx`(`fileId`),
    INDEX `comments_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_replies` (
    `id` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `comment_replies_commentId_idx`(`commentId`),
    INDEX `comment_replies_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reactions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('LIKE', 'LOVE', 'HAHA', 'CRY', 'CARE', 'WOW', 'SAD', 'ANGRY', 'THUMBS_UP', 'THUMBS_DOWN', 'LAUGH', 'SUPPORT', 'THANK', 'PRAY', 'HOPE', 'JOY', 'CELEBRATE') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reactions_userId_idx`(`userId`),
    INDEX `reactions_fileId_idx`(`fileId`),
    UNIQUE INDEX `reactions_userId_fileId_key`(`userId`, `fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileHistory` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('UPLOADED', 'UPDATED', 'DELETED', 'RESTORED', 'VISIBILITY_CHANGED', 'RESIZED', 'COMPRESSED', 'TAGGED', 'SHARED', 'COLLECTED', 'COMMENTED', 'LIKED', 'UNLIKED', 'REPLIED', 'VIEWED', 'DOWNLOADED') NOT NULL,
    `oldValue` VARCHAR(191) NULL,
    `newValue` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FileHistory_fileId_idx`(`fileId`),
    INDEX `FileHistory_userId_idx`(`userId`),
    INDEX `FileHistory_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL,

    INDEX `tags_tag_idx`(`tag`),
    UNIQUE INDEX `tags_fileId_tag_key`(`fileId`, `tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Visibility` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `visibleUsers` VARCHAR(191) NOT NULL DEFAULT '',
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `editedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Visibility_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_contact` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `personalInformationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `emergency_contact_userId_idx`(`userId`),
    INDEX `emergency_contact_personalInformationId_idx`(`personalInformationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `emergency_requests_userId_idx`(`userId`),
    INDEX `emergency_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospitals` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `hospitals_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_question` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `security_question_userId_key`(`userId`),
    INDEX `security_question_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_consent` (
    `id` VARCHAR(191) NOT NULL,
    `consented` BOOLEAN NOT NULL,
    `consentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    INDEX `user_consent_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_token` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `deviceType` ENUM('WEB', 'DESKTOP', 'MOBILE', 'TABLET', 'OTHER') NULL,
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    INDEX `device_token_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` JSON NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    INDEX `audit_log_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback_request` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `feedback_request_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_activities` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('REGISTER', 'REGISTER_SUCCESS', 'REGISTER_FAILED', 'LOGIN', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_SUCCESS', 'LOGOUT_FAILED', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'SECURITY_SETTING_CHANGE', 'ACCOUNT_DEACTIVATION', 'ACCOUNT_REACTIVATION', 'CONTENT_CREATION', 'CONTENT_DELETION', 'CONTENT_UPDATE', 'FRIEND_REQUEST', 'MESSAGE_SEND', 'FILE_UPLOAD', 'PAYMENT_MADE', 'SUBSCRIPTION_CHANGE', 'NOTIFICATION_SETTINGS_UPDATE', 'PRIVACY_SETTINGS_UPDATE', 'TWO_FACTOR_TOGGLE', 'DEVICE_ADDED', 'DEVICE_REMOVED', 'API_ACCESS', 'REPORT_GENERATION', 'FEEDBACK_SUBMISSION', 'GET_CURRENT_USER', 'GET_CURRENT_USER_FAILED', 'GET_USER_PROFILE', 'UPDATE_USER_PROFILE', 'DELETE_USER_PROFILE', 'USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILED', 'USER_LOGOUT_SUCCESS', 'USER_LOGOUT_FAILED', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_FAILED', 'EMAIL_VERIFICATION_SENT', 'EMAIL_VERIFICATION_SUCCESS', 'EMAIL_VERIFICATION_FAILED', 'PHONE_VERIFICATION_SENT', 'PHONE_VERIFICATION_SUCCESS', 'PHONE_VERIFICATION_FAILED', 'TWO_FACTOR_SETUP', 'TWO_FACTOR_VERIFICATION', 'ACCOUNT_SETTINGS_UPDATE', 'PROFILE_PICTURE_UPDATE', 'USER_SESSION_START', 'USER_SESSION_END', 'USER_DATA_EXPORT', 'USER_DATA_DELETE', 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'SECURITY_ALERT', 'ACCOUNT_RECOVERY', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELLED', 'PAYMENT_PROCESSED', 'PAYMENT_FAILED', 'DOCUMENT_UPLOAD', 'DOCUMENT_DELETE', 'EMERGENCY_CONTACT_ADDED', 'EMERGENCY_CONTACT_REMOVED', 'FEEDBACK_SUBMITTED', 'REPORT_DOWNLOADED', 'SETTINGS_CHANGED', 'NOTIFICATION_SENT', 'ACCOUNT_LINKED', 'ACCOUNT_UNLINKED', 'ROLE_ASSIGNED', 'ROLE_REMOVED', 'MEMBERSHIP_UPGRADED', 'MEMBERSHIP_DOWNGRADED', 'ACTIVITY_DATA_EXPORT') NOT NULL,
    `details` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `deviceInfo` JSON NULL,
    `location` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_activities_userId_idx`(`userId`),
    INDEX `user_activities_type_idx`(`type`),
    INDEX `user_activities_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_interactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `interactionType` ENUM('VIEW', 'LIKE', 'COMMENT', 'SHARE', 'FOLLOW', 'UNFOLLOW', 'BLOCK', 'UNBLOCK', 'REPORT', 'BOOKMARK', 'RATE', 'REACT', 'MENTION', 'TAG', 'INVITE', 'RSVP', 'DOWNLOAD', 'PRINT', 'SEARCH') NOT NULL,
    `targetId` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_interactions_userId_idx`(`userId`),
    INDEX `user_interactions_interactionType_idx`(`interactionType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `deviceInfo` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `user_sessions_userId_idx`(`userId`),
    INDEX `user_sessions_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `totalSessionTime` INTEGER NOT NULL DEFAULT 0,
    `averageSessionLength` DOUBLE NOT NULL DEFAULT 0,
    `lastNSessions` JSON NULL,
    `dailyActivityStats` JSON NULL,
    `weeklyActivityStats` JSON NULL,
    `monthlyActivityStats` JSON NULL,

    UNIQUE INDEX `user_metrics_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_data` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dataType` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_data_userId_idx`(`userId`),
    INDEX `analytics_data_dataType_idx`(`dataType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pregnancy_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `pregnancyWeek` INTEGER NOT NULL,
    `lastMenstrualDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'COMPLETED', 'TERMINATED', 'LOST', 'ON_HOLD') NOT NULL DEFAULT 'ACTIVE',
    `height` DOUBLE NULL,
    `prePregnancyWeight` DOUBLE NULL,
    `currentWeight` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `bloodPressure` VARCHAR(191) NULL,
    `bloodGroup` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN') NULL,
    `isFirstPregnancy` BOOLEAN NULL DEFAULT false,
    `previousPregnancies` INTEGER NULL DEFAULT 0,
    `previousComplications` JSON NULL,
    `pregnancyType` VARCHAR(191) NULL,
    `conceptionMethod` VARCHAR(191) NULL,
    `hasGestationalDiabetes` BOOLEAN NULL DEFAULT false,
    `hasPreeclampsia` BOOLEAN NULL DEFAULT false,
    `hasAnemia` BOOLEAN NULL DEFAULT false,
    `otherConditions` JSON NULL,
    `smokingStatus` VARCHAR(191) NULL,
    `alcoholConsumption` VARCHAR(191) NULL,
    `exerciseFrequency` VARCHAR(191) NULL,
    `dietaryRestrictions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pregnancy_profiles_userId_key`(`userId`),
    INDEX `pregnancy_profiles_userId_idx`(`userId`),
    INDEX `pregnancy_profiles_isActive_idx`(`isActive`),
    INDEX `pregnancy_profiles_status_idx`(`status`),
    INDEX `pregnancy_profiles_pregnancyWeek_idx`(`pregnancyWeek`),
    INDEX `pregnancy_profiles_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `bmi` DOUBLE NOT NULL,
    `nutritionStatus` VARCHAR(191) NOT NULL,
    `exerciseHabits` VARCHAR(191) NOT NULL,
    `psychologicalHealth` VARCHAR(191) NOT NULL,
    `sleepPatterns` VARCHAR(191) NOT NULL,
    `chronicConditions` JSON NOT NULL,
    `isSmoker` BOOLEAN NOT NULL,
    `alcoholConsumption` BOOLEAN NOT NULL,
    `substanceUse` BOOLEAN NOT NULL,
    `dietQuality` VARCHAR(191) NOT NULL,
    `familyPlanningHistory` BOOLEAN NOT NULL,
    `previousPregnancies` INTEGER NOT NULL,
    `hasAllergies` BOOLEAN NOT NULL,
    `infectionHistory` BOOLEAN NOT NULL,
    `medicationUsage` BOOLEAN NOT NULL,
    `bloodPressureStatus` VARCHAR(191) NOT NULL,
    `bloodSugarStatus` VARCHAR(191) NOT NULL,
    `medicalCheckups` VARCHAR(191) NOT NULL,
    `occupationalHazards` BOOLEAN NOT NULL,
    `environmentalExposure` BOOLEAN NOT NULL,
    `partnerHealthStatus` VARCHAR(191) NOT NULL,
    `socialSupportLevel` VARCHAR(191) NOT NULL,
    `financialStability` VARCHAR(191) NOT NULL,
    `educationLevel` VARCHAR(191) NOT NULL,
    `currentMedications` JSON NOT NULL,
    `surgicalHistory` JSON NOT NULL,
    `mentalHealthStatus` VARCHAR(191) NOT NULL,
    `sleepQuality` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `height` DOUBLE NOT NULL,
    `allergies` JSON NOT NULL,
    `geneticDisorders` JSON NOT NULL,
    `pregnancyComplications` JSON NOT NULL,
    `riskScore` DOUBLE NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recommendations` TEXT NOT NULL,
    `referenceRanges` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `risk_assessments_userId_idx`(`userId`),
    INDEX `risk_assessments_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `health_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `measuredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `health_metrics_userId_key`(`userId`),
    INDEX `health_metrics_userId_idx`(`userId`),
    INDEX `health_metrics_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `symptom_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `symptom` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `onsetDate` DATETIME(3) NOT NULL,
    `resolutionDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `symptom_logs_userId_key`(`userId`),
    INDEX `symptom_logs_userId_idx`(`userId`),
    INDEX `symptom_logs_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_appointments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `medical_appointments_userId_key`(`userId`),
    INDEX `medical_appointments_userId_idx`(`userId`),
    INDEX `medical_appointments_pregnancyId_idx`(`pregnancyId`),
    INDEX `medical_appointments_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctors` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `hospital` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctors_specialty_idx`(`specialty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_records` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `results` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `file` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `medical_records_userId_key`(`userId`),
    INDEX `medical_records_userId_idx`(`userId`),
    INDEX `medical_records_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baby_kicks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `duration` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `baby_kicks_userId_key`(`userId`),
    INDEX `baby_kicks_userId_idx`(`userId`),
    INDEX `baby_kicks_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutrition_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `mealType` VARCHAR(191) NOT NULL,
    `foodItems` JSON NOT NULL,
    `notes` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nutrition_logs_userId_key`(`userId`),
    INDEX `nutrition_logs_userId_idx`(`userId`),
    INDEX `nutrition_logs_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `duration` DOUBLE NOT NULL,
    `intensity` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exercise_logs_userId_key`(`userId`),
    INDEX `exercise_logs_userId_idx`(`userId`),
    INDEX `exercise_logs_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mental_health_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `mood` VARCHAR(191) NOT NULL,
    `stressLevel` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mental_health_logs_userId_key`(`userId`),
    INDEX `mental_health_logs_userId_idx`(`userId`),
    INDEX `mental_health_logs_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `medications_userId_key`(`userId`),
    INDEX `medications_userId_idx`(`userId`),
    INDEX `medications_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `health_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `triggeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `health_alerts_userId_key`(`userId`),
    INDEX `health_alerts_userId_idx`(`userId`),
    INDEX `health_alerts_pregnancyId_idx`(`pregnancyId`),
    INDEX `health_alerts_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_services` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `emergency_services_userId_idx`(`userId`),
    INDEX `emergency_services_pregnancyId_idx`(`pregnancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `telemedicine_consultations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `telemedicine_consultations_userId_idx`(`userId`),
    INDEX `telemedicine_consultations_pregnancyId_idx`(`pregnancyId`),
    INDEX `telemedicine_consultations_doctorId_idx`(`doctorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BDT',
    `status` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payment_transactions_userId_idx`(`userId`),
    INDEX `payment_transactions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_prediction_responses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NULL,
    `assessmentId` VARCHAR(191) NULL,
    `type` ENUM('PREGNANCY', 'HEALTH', 'SECURITY', 'NUTRITION', 'MENTAL_HEALTH', 'EXERCISE', 'MEDICATION', 'EMERGENCY', 'OTHER') NOT NULL,
    `category` ENUM('RISK_ASSESSMENT', 'RECOMMENDATION', 'WARNING', 'ANALYSIS', 'TREND', 'ALERT', 'GUIDANCE', 'PROTOCOL', 'OTHER') NOT NULL,
    `subCategory` VARCHAR(191) NULL,
    `data` JSON NOT NULL,
    `summary` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `riskScore` DOUBLE NULL,
    `riskLevel` VARCHAR(191) NULL,
    `riskTrend` VARCHAR(191) NULL,
    `previousScore` DOUBLE NULL,
    `scoreChange` DOUBLE NULL,
    `medicalRisks` JSON NULL,
    `lifestyleRisks` JSON NULL,
    `environmentalRisks` JSON NULL,
    `recommendations` JSON NULL,
    `warnings` JSON NULL,
    `locationData` JSON NULL,
    `followUp` JSON NULL,
    `metadata` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ai_prediction_responses_userId_idx`(`userId`),
    INDEX `ai_prediction_responses_pregnancyId_idx`(`pregnancyId`),
    INDEX `ai_prediction_responses_assessmentId_idx`(`assessmentId`),
    INDEX `ai_prediction_responses_type_idx`(`type`),
    INDEX `ai_prediction_responses_category_idx`(`category`),
    INDEX `ai_prediction_responses_status_idx`(`status`),
    INDEX `ai_prediction_responses_userId_type_category_idx`(`userId`, `type`, `category`),
    INDEX `ai_prediction_responses_userId_pregnancyId_assessmentId_idx`(`userId`, `pregnancyId`, `assessmentId`),
    INDEX `ai_prediction_responses_userId_pregnancyId_idx`(`userId`, `pregnancyId`),
    INDEX `ai_prediction_responses_userId_assessmentId_idx`(`userId`, `assessmentId`),
    INDEX `ai_prediction_responses_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `speciality` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL,
    `availableDays` JSON NOT NULL,
    `timeSlots` JSON NOT NULL,
    `status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
    `consultationFee` DOUBLE NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `doctor_profiles_userId_key`(`userId`),
    INDEX `doctor_profiles_userId_idx`(`userId`),
    INDEX `doctor_profiles_speciality_idx`(`speciality`),
    INDEX `doctor_profiles_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_appointments` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `timeSlot` VARCHAR(191) NOT NULL,
    `type` ENUM('INSTANT', 'SCHEDULED') NOT NULL,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PROCESSING', 'SUCCESS') NOT NULL DEFAULT 'PENDING',
    `amount` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_appointments_doctorId_idx`(`doctorId`),
    INDEX `doctor_appointments_patientId_idx`(`patientId`),
    INDEX `doctor_appointments_appointmentDate_idx`(`appointmentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_reviews_doctorId_idx`(`doctorId`),
    INDEX `doctor_reviews_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_chats` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_chats_doctorId_idx`(`doctorId`),
    INDEX `doctor_chats_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_calls` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `type` ENUM('AUDIO', 'VIDEO') NOT NULL,
    `status` ENUM('INITIATED', 'RINGING', 'CONNECTED', 'ENDED', 'MISSED', 'REJECTED') NOT NULL DEFAULT 'INITIATED',
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `doctor_calls_doctorId_idx`(`doctorId`),
    INDEX `doctor_calls_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ambulances` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('BASIC', 'ADVANCED', 'ICU') NOT NULL,
    `status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `location` JSON NOT NULL,
    `driverId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ambulances_vehicleNumber_key`(`vehicleNumber`),
    UNIQUE INDEX `ambulances_driverId_key`(`driverId`),
    INDEX `ambulances_status_idx`(`status`),
    INDEX `ambulances_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ambulance_drivers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalTrips` INTEGER NOT NULL DEFAULT 0,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ambulance_drivers_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `ambulance_drivers_licenseNumber_key`(`licenseNumber`),
    INDEX `ambulance_drivers_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ambulance_bookings` (
    `id` VARCHAR(191) NOT NULL,
    `ambulanceId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `pickupLocation` JSON NOT NULL,
    `dropLocation` JSON NOT NULL,
    `status` ENUM('REQUESTED', 'ACCEPTED', 'STARTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PROCESSING', 'SUCCESS') NOT NULL DEFAULT 'PENDING',
    `amount` DOUBLE NOT NULL,
    `distance` DOUBLE NOT NULL,
    `estimatedTime` INTEGER NOT NULL,
    `actualTime` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ambulance_bookings_ambulanceId_idx`(`ambulanceId`),
    INDEX `ambulance_bookings_patientId_idx`(`patientId`),
    INDEX `ambulance_bookings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FileCollections` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FileCollections_AB_unique`(`A`, `B`),
    INDEX `_FileCollections_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FileAlbums` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FileAlbums_AB_unique`(`A`, `B`),
    INDEX `_FileAlbums_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DoctorDocuments` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DoctorDocuments_AB_unique`(`A`, `B`),
    INDEX `_DoctorDocuments_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_passwordPolicyId_fkey` FOREIGN KEY (`passwordPolicyId`) REFERENCES `PasswordPolicy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_membershipTierId_fkey` FOREIGN KEY (`membershipTierId`) REFERENCES `membership_tiers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_recovery_contact_id_fkey` FOREIGN KEY (`recovery_contact_id`) REFERENCES `recovery_contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal_information` ADD CONSTRAINT `personal_information_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_numbers` ADD CONSTRAINT `contact_numbers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `personal_information`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `personal_information`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `websites` ADD CONSTRAINT `websites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `personal_information`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education_qualifications` ADD CONSTRAINT `education_qualifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_information` ADD CONSTRAINT `medical_information_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_report` ADD CONSTRAINT `medical_report_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_report` ADD CONSTRAINT `medical_report_medicalInfoId_fkey` FOREIGN KEY (`medicalInfoId`) REFERENCES `medical_information`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription` ADD CONSTRAINT `prescription_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription` ADD CONSTRAINT `prescription_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription` ADD CONSTRAINT `prescription_medicalInfoId_fkey` FOREIGN KEY (`medicalInfoId`) REFERENCES `medical_information`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_preferences` ADD CONSTRAINT `account_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ip_whitelist` ADD CONSTRAINT `ip_whitelist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trusted_devices` ADD CONSTRAINT `trusted_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `two_factor_auth` ADD CONSTRAINT `two_factor_auth_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_codes` ADD CONSTRAINT `backup_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `two_factor_sessions` ADD CONSTRAINT `two_factor_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_log_settings` ADD CONSTRAINT `activity_log_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserActivityLog` ADD CONSTRAINT `UserActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badges` ADD CONSTRAINT `Badges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forum_Post` ADD CONSTRAINT `Forum_Post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forum_Comment` ADD CONSTRAINT `Forum_Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Forum_Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forum_Comment` ADD CONSTRAINT `Forum_Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFollows` ADD CONSTRAINT `UserFollows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFollows` ADD CONSTRAINT `UserFollows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forum_Reply` ADD CONSTRAINT `Forum_Reply_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Forum_Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Forum_Reply` ADD CONSTRAINT `Forum_Reply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_referredBy_fkey` FOREIGN KEY (`referredBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sessions` ADD CONSTRAINT `Sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `API_keys` ADD CONSTRAINT `API_keys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OAuth_Credentials` ADD CONSTRAINT `OAuth_Credentials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Linked_Accounts` ADD CONSTRAINT `Linked_Accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_history` ADD CONSTRAINT `password_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_activity` ADD CONSTRAINT `password_reset_activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_security_logs` ADD CONSTRAINT `password_security_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `forgot_passwords` ADD CONSTRAINT `forgot_passwords_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_verifications` ADD CONSTRAINT `password_reset_verifications_forgotPasswordId_fkey` FOREIGN KEY (`forgotPasswordId`) REFERENCES `forgot_passwords`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_attempts` ADD CONSTRAINT `login_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passkeys` ADD CONSTRAINT `passkeys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webauthn_challenges` ADD CONSTRAINT `webauthn_challenges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `multi_factor_methods` ADD CONSTRAINT `multi_factor_methods_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `user_roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_cards` ADD CONSTRAINT `payment_cards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_bonus` ADD CONSTRAINT `referral_bonus_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `storage` ADD CONSTRAINT `storage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shares` ADD CONSTRAINT `shares_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shares` ADD CONSTRAINT `shares_sharedBy_fkey` FOREIGN KEY (`sharedBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shares` ADD CONSTRAINT `shares_sharedWith_fkey` FOREIGN KEY (`sharedWith`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `albums` ADD CONSTRAINT `albums_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_replies` ADD CONSTRAINT `comment_replies_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_replies` ADD CONSTRAINT `comment_replies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reactions` ADD CONSTRAINT `reactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reactions` ADD CONSTRAINT `reactions_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileHistory` ADD CONSTRAINT `FileHistory_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tags_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contact` ADD CONSTRAINT `emergency_contact_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contact` ADD CONSTRAINT `emergency_contact_personalInformationId_fkey` FOREIGN KEY (`personalInformationId`) REFERENCES `personal_information`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_requests` ADD CONSTRAINT `emergency_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_question` ADD CONSTRAINT `security_question_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_consent` ADD CONSTRAINT `user_consent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_token` ADD CONSTRAINT `device_token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback_request` ADD CONSTRAINT `feedback_request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interactions` ADD CONSTRAINT `user_interactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_metrics` ADD CONSTRAINT `user_metrics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_data` ADD CONSTRAINT `analytics_data_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pregnancy_profiles` ADD CONSTRAINT `pregnancy_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessments` ADD CONSTRAINT `risk_assessments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessments` ADD CONSTRAINT `risk_assessments_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_metrics` ADD CONSTRAINT `health_metrics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_metrics` ADD CONSTRAINT `health_metrics_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `symptom_logs` ADD CONSTRAINT `symptom_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `symptom_logs` ADD CONSTRAINT `symptom_logs_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_appointments` ADD CONSTRAINT `medical_appointments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_appointments` ADD CONSTRAINT `medical_appointments_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_appointments` ADD CONSTRAINT `medical_appointments_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `baby_kicks` ADD CONSTRAINT `baby_kicks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `baby_kicks` ADD CONSTRAINT `baby_kicks_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_logs` ADD CONSTRAINT `nutrition_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_logs` ADD CONSTRAINT `nutrition_logs_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_logs` ADD CONSTRAINT `exercise_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_logs` ADD CONSTRAINT `exercise_logs_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mental_health_logs` ADD CONSTRAINT `mental_health_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mental_health_logs` ADD CONSTRAINT `mental_health_logs_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medications` ADD CONSTRAINT `medications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medications` ADD CONSTRAINT `medications_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_alerts` ADD CONSTRAINT `health_alerts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_alerts` ADD CONSTRAINT `health_alerts_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_services` ADD CONSTRAINT `emergency_services_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_services` ADD CONSTRAINT `emergency_services_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `telemedicine_consultations` ADD CONSTRAINT `telemedicine_consultations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `telemedicine_consultations` ADD CONSTRAINT `telemedicine_consultations_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `telemedicine_consultations` ADD CONSTRAINT `telemedicine_consultations_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `telemedicine_consultations` ADD CONSTRAINT `telemedicine_consultations_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment_transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_prediction_responses` ADD CONSTRAINT `ai_prediction_responses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_prediction_responses` ADD CONSTRAINT `ai_prediction_responses_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `pregnancy_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_prediction_responses` ADD CONSTRAINT `ai_prediction_responses_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `risk_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_profiles` ADD CONSTRAINT `doctor_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_appointments` ADD CONSTRAINT `doctor_appointments_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_appointments` ADD CONSTRAINT `doctor_appointments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_reviews` ADD CONSTRAINT `doctor_reviews_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_reviews` ADD CONSTRAINT `doctor_reviews_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_chats` ADD CONSTRAINT `doctor_chats_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_chats` ADD CONSTRAINT `doctor_chats_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_calls` ADD CONSTRAINT `doctor_calls_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_calls` ADD CONSTRAINT `doctor_calls_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ambulances` ADD CONSTRAINT `ambulances_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `ambulance_drivers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ambulance_bookings` ADD CONSTRAINT `ambulance_bookings_ambulanceId_fkey` FOREIGN KEY (`ambulanceId`) REFERENCES `ambulances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ambulance_bookings` ADD CONSTRAINT `ambulance_bookings_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FileCollections` ADD CONSTRAINT `_FileCollections_A_fkey` FOREIGN KEY (`A`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FileCollections` ADD CONSTRAINT `_FileCollections_B_fkey` FOREIGN KEY (`B`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FileAlbums` ADD CONSTRAINT `_FileAlbums_A_fkey` FOREIGN KEY (`A`) REFERENCES `albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FileAlbums` ADD CONSTRAINT `_FileAlbums_B_fkey` FOREIGN KEY (`B`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorDocuments` ADD CONSTRAINT `_DoctorDocuments_A_fkey` FOREIGN KEY (`A`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorDocuments` ADD CONSTRAINT `_DoctorDocuments_B_fkey` FOREIGN KEY (`B`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
