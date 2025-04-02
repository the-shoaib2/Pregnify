import os from 'os';
import prisma from './prisma.js';

export const getSystemInfo = async () => {
    const memoryUsage = process.memoryUsage();
    
    // Test database connection
    let dbStatus = 'connected';
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
        dbStatus = 'disconnected';
    }

    return {
        memory: {
            total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
            free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
        },
        cpu: {
            cores: os.cpus().length,
            model: os.cpus()[0].model,
            loadAvg: os.loadavg()
        },
        platform: process.platform,
        nodeVersion: process.version,
        database: {
            status: dbStatus
        }
    };
};
