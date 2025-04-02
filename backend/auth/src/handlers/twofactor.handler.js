import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import prisma from '../utils/database/prisma.js';
import { emailService } from '../helpers/email/email_service.js';
import { APP_NAME } from '../constants/index.js';




class TwoFactorHandler {
    async setupTOTP(userId) {
        const secret = authenticator.generateSecret();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        const otpauthUrl = authenticator.keyuri(
            user.email,
            APP_NAME,
            secret
        );



        await prisma.twoFactorAuth.create({
            data: {
                userId,
                secret,
                method: 'TOTP',
                isVerified: false
            }
        });

        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        return { secret, qrCodeDataUrl };
    }

    async verifyTOTP(userId, token) {
        const twoFactorAuth = await prisma.twoFactorAuth.findFirst({
            where: { userId, method: 'TOTP' }
        });

        if (!twoFactorAuth) return false;

        return authenticator.verify({
            token,
            secret: twoFactorAuth.secret
        });
    }

    async setupSMS(userId, phoneNumber) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        
        await prisma.twoFactorAuth.create({
            data: {
                userId,
                method: 'SMS',
                phoneNumber,
                verificationCode: String(verificationCode),
                verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                isVerified: false
            }
        });

        // Send SMS with verification code
        // Implement SMS service integration here
        
        return true;
    }

    async verifySMS(userId, code) {
        const twoFactorAuth = await prisma.twoFactorAuth.findFirst({
            where: {
                userId,
                method: 'SMS',
                verificationCode: code,
                verificationCodeExpiry: { gt: new Date() }
            }
        });

        if (!twoFactorAuth) return false;

        await prisma.twoFactorAuth.update({
            where: { id: twoFactorAuth.id },
            data: { isVerified: true }
        });

        return true;
    }

    async generateRecoveryEmail(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const recoveryCode = generateRandomString(32);
        
        await prisma.recoveryCode.create({
            data: {
                userId,
                code: recoveryCode,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
        });

        await emailService.sendRecoveryCode(
            user.email,
            user.firstName,
            recoveryCode
        );

        return true;
    }

    async verifyRecoveryCode(userId, code) {
        const recoveryCode = await prisma.recoveryCode.findFirst({
            where: {
                userId,
                code,
                expiresAt: { gt: new Date() },
                used: false
            }
        });

        if (!recoveryCode) return false;

        await prisma.recoveryCode.update({
            where: { id: recoveryCode.id },
            data: { used: true }
        });

        return true;
    }

    async enforceDeviceLimit(userId) {
        const activeSessions = await prisma.session.findMany({
            where: { userId, isActive: true }
        });

        if (activeSessions.length > 1) {
            // Keep only the most recent session
            const [mostRecent, ...oldSessions] = activeSessions.sort(
                (a, b) => b.lastActive - a.lastActive
            );

            await prisma.session.updateMany({
                where: {
                    id: { in: oldSessions.map(s => s.id) }
                },
                data: { isActive: false }
            });

            // Notify user about logged out sessions
            const user = await prisma.user.findUnique({ where: { id: userId } });
            await emailService.sendSessionTerminationEmail(
                user.email,
                user.firstName,
                oldSessions.length
            );
        }
    }
}

export default new TwoFactorHandler();
