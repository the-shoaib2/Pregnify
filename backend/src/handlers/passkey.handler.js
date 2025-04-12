import prisma from '../utils/prisma.js';
import { generateRandomString, hashData } from '../utils/crypto.utils.js';
import { emailService } from '../helpers/email/email_service.js';

class PasskeyHandler {
    async generateBackupCodes(userId, count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            const code = generateRandomString(16);
            codes.push(code);
            
            await prisma.backupCode.create({
                data: {
                    userId,
                    code: await hashData(code),
                    used: false
                }
            });
        }
        return codes;
    }

    async verifyBackupCode(userId, code) {
        const hashedCode = await hashData(code);
        const backupCode = await prisma.backupCode.findFirst({
            where: {
                userId,
                code: hashedCode,
                used: false
            }
        });

        if (backupCode) {
            await prisma.backupCode.update({
                where: { id: backupCode.id },
                data: { used: true }
            });
            return true;
        }
        return false;
    }

    async addTrustedDevice(userId, deviceInfo) {
        return await prisma.trustedDevice.create({
            data: {
                userId,
                deviceId: deviceInfo.deviceId,
                deviceName: deviceInfo.deviceName,
                lastUsed: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });
    }

    async verifyTrustedDevice(userId, deviceId) {
        const device = await prisma.trustedDevice.findFirst({
            where: {
                userId,
                deviceId,
                expiresAt: { gt: new Date() }
            }
        });
        return !!device;
    }
}

export default new PasskeyHandler();
