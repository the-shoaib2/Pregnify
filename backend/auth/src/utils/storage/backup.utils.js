import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import prisma from './prisma.js';
import logger from '../../logger/index.js';

// Backup validation and constants
const VALID_BACKUP_TYPES = ['FULL', 'PARTIAL', 'SETTINGS', 'CONTENT', 'LOGS'];
const MAX_BACKUP_SIZE = 1024 * 1024 * 1024; // 1GB
const BACKUP_CHUNK_SIZE = 1024 * 1024 * 10; // 10MB

export const createBackupArchive = async (userId, type, includeData = []) => {
    const backupDir = path.join(process.env.BACKUP_PATH, userId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type}-${timestamp}.zip`;
    const filepath = path.join(backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Create write stream and archive
    const output = createWriteStream(filepath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive to file
    archive.pipe(output);

    try {
        // Add data based on type and includeData
        if (type === 'FULL' || includeData.includes('SETTINGS')) {
            const settings = await prisma.userSettings.findUnique({
                where: { userId }
            });
            archive.append(JSON.stringify(settings, null, 2), { name: 'settings.json' });
        }

        if (type === 'FULL' || includeData.includes('CONTENT')) {
            const content = await prisma.userContent.findMany({
                where: { userId }
            });
            archive.append(JSON.stringify(content, null, 2), { name: 'content.json' });
        }

        if (includeData.includes('LOGS')) {
            const logs = await prisma.userActivityLog.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' }
            });
            archive.append(JSON.stringify(logs, null, 2), { name: 'activity-logs.json' });
        }

        // Finalize archive
        await archive.finalize();

        // Get backup size
        const stats = await fs.stat(filepath);
        return {
            path: filepath,
            size: stats.size,
            filename
        };

    } catch (error) {
        logger.error('Backup creation failed', { error, userId, type });
        throw new Error('Failed to create backup archive');
    }
};

export const getBackupSize = async (filepath) => {
    try {
        const stats = await fs.stat(filepath);
        return stats.size;
    } catch (error) {
        logger.error('Failed to get backup size', { error, filepath });
        return 0;
    }
};

export const restoreFromBackup = async (userId, backupPath, options = {}) => {
    const { type = 'FULL', includeData = [] } = options;

    try {
        // Read and parse backup files
        const files = await fs.readdir(backupPath);

        for (const file of files) {
            const content = await fs.readFile(path.join(backupPath, file), 'utf8');
            const data = JSON.parse(content);

            await prisma.$transaction(async (tx) => {
                switch (file) {
                    case 'settings.json':
                        if (type === 'FULL' || includeData.includes('SETTINGS')) {
                            await tx.userSettings.upsert({
                                where: { userId },
                                update: data,
                                create: { ...data, userId }
                            });
                        }
                        break;

                    case 'content.json':
                        if (type === 'FULL' || includeData.includes('CONTENT')) {
                            // Delete existing content first
                            await tx.userContent.deleteMany({
                                where: { userId }
                            });
                            // Restore content
                            await tx.userContent.createMany({
                                data: data.map(item => ({ ...item, userId }))
                            });
                        }
                        break;

                    // Add more cases for other backup components
                }
            });
        }

        // Log successful restore
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: 'BACKUP_RESTORED',
                description: `${type} backup restored`,
                metadata: { includeData }
            }
        });

        return true;
    } catch (error) {
        logger.error('Backup restoration failed', { error, userId, backupPath });
        throw new Error('Failed to restore from backup');
    }
};

export const cleanupOldBackups = async (userId, retentionDays = 30) => {
    const backupDir = path.join(process.env.BACKUP_PATH, userId);
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    try {
        const files = await fs.readdir(backupDir);
        let deletedCount = 0;

        for (const file of files) {
            const filepath = path.join(backupDir, file);
            const stats = await fs.stat(filepath);

            if (now - stats.mtime.getTime() > retentionMs) {
                await fs.unlink(filepath);
                deletedCount++;
            }
        }

        return deletedCount;
    } catch (error) {
        logger.error('Backup cleanup failed', { error, userId });
        throw new Error('Failed to cleanup old backups');
    }
};

// Add validation helper
export const validateBackupRequest = async (userId, type, includeData = []) => {
    // Validate backup type
    if (!VALID_BACKUP_TYPES.includes(type)) {
        throw new Error(`Invalid backup type. Must be one of: ${VALID_BACKUP_TYPES.join(', ')}`);
    }

    // Check user's backup quota
    const userBackups = await prisma.backups.findMany({
        where: { userId }
    });

    const totalSize = userBackups.reduce((sum, backup) => sum + (backup.size || 0), 0);
    if (totalSize >= MAX_BACKUP_SIZE) {
        throw new Error('Backup quota exceeded. Please clean up old backups first.');
    }

    return true;
};

// Add backup encryption
export const encryptBackup = async (data, encryptionKey) => {
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

// Add backup decryption
export const decryptBackup = async (encryptedData, encryptionKey) => {
    const crypto = await import('crypto');
    const algorithm = 'aes-256-gcm';
    
    const key = crypto.pbkdf2Sync(
        encryptionKey,
        Buffer.from(encryptedData.salt, 'hex'),
        100000,
        32,
        'sha256'
    );
    
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
};

// Add streaming backup for large datasets
export const streamBackupCreation = async (userId, type, includeData = []) => {
    const backupDir = path.join(process.env.BACKUP_PATH, userId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type}-${timestamp}.zip`;
    const filepath = path.join(backupDir, filename);

    await fs.mkdir(backupDir, { recursive: true });

    const output = createWriteStream(filepath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.pipe(output);

    // Stream data in chunks
    if (type === 'FULL' || includeData.includes('CONTENT')) {
        let skip = 0;
        const batchSize = 100;
        
        while (true) {
            const content = await prisma.userContent.findMany({
                where: { userId },
                skip,
                take: batchSize,
                orderBy: { id: 'asc' }
            });

            if (content.length === 0) break;

            archive.append(JSON.stringify(content), { name: `content-${skip}.json` });
            skip += batchSize;
        }
    }

    await archive.finalize();
    return filepath;
};

// Add backup verification
export const verifyBackup = async (filepath) => {
    try {
        const readStream = createReadStream(filepath);
        const extract = require('extract-zip');
        const tempDir = path.join(process.env.TEMP_PATH, 'backup-verify');
        
        await fs.mkdir(tempDir, { recursive: true });
        await extract(filepath, { dir: tempDir });

        const files = await fs.readdir(tempDir);
        for (const file of files) {
            const content = await fs.readFile(path.join(tempDir, file), 'utf8');
            JSON.parse(content); // Verify JSON is valid
        }

        await fs.rm(tempDir, { recursive: true });
        return true;
    } catch (error) {
        logger.error('Backup verification failed', { error, filepath });
        return false;
    }
};

// Add backup compression options
export const compressBackup = async (filepath, compressionLevel = 9) => {
    const compressedPath = `${filepath}.gz`;
    const zlib = await import('zlib');
    const { promisify } = await import('util');
    const gzip = promisify(zlib.gzip);

    const content = await fs.readFile(filepath);
    const compressed = await gzip(content, { level: compressionLevel });
    await fs.writeFile(compressedPath, compressed);

    return compressedPath;
}; 