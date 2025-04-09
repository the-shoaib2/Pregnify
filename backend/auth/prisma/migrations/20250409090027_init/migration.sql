/*
  Warnings:

  - You are about to drop the `emergencyrequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `emergencyrequest` DROP FOREIGN KEY `EmergencyRequest_userId_fkey`;

-- AlterTable
ALTER TABLE `risk_assessments` ADD COLUMN `referenceRanges` JSON NULL;

-- DropTable
DROP TABLE `emergencyrequest`;

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
CREATE TABLE `_DoctorDocuments` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DoctorDocuments_AB_unique`(`A`, `B`),
    INDEX `_DoctorDocuments_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `prescription_doctorId_idx` ON `prescription`(`doctorId`);

-- AddForeignKey
ALTER TABLE `prescription` ADD CONSTRAINT `prescription_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctor_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_requests` ADD CONSTRAINT `emergency_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `_DoctorDocuments` ADD CONSTRAINT `_DoctorDocuments_A_fkey` FOREIGN KEY (`A`) REFERENCES `doctor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorDocuments` ADD CONSTRAINT `_DoctorDocuments_B_fkey` FOREIGN KEY (`B`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
