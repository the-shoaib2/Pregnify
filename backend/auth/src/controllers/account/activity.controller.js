import prisma from '../../utils/database/prisma.js';
import ApiError from '../../utils/error/api.error.js';
import asyncHandler from '../../utils/middleware/async.handler.js';
import { userWebSocketService } from '../../server.js';
import { Parser as Json2CsvParser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const getActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 1000, type } = req.query;

    const where = {
        userId,
        ...(type && { activityType: type })
    };

    const [logs, total] = await Promise.all([
        prisma.userActivityLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                activityType: true,
                description: true,
                timestamp: true,
                ipAddress: true,
                userAgent: true,
                metadata: true
            }
        }),
        prisma.userActivityLog.count({ where })
    ]);

    res.json({
        success: true,
        data: {
            logs,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        }
    });
});

export const getActivityStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = {
        userId,
        ...(startDate && endDate && {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        })
    };

    // First get the counts grouped by activity type
    const stats = await prisma.userActivityLog.groupBy({
        by: ['activityType'],
        where: whereClause,
        _count: true
    });

    // Sort the results manually
    const sortedStats = stats.sort((a, b) => b._count - a._count);

    res.json({
        success: true,
        data: sortedStats
    });
});

export const getActiveSessions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const sessions = await prisma.userSession.findMany({
        where: {
            userId,
            isActive: true
        },
        select: {
            id: true,
            deviceInfo: true,
            ipAddress: true,
            location: true,
            startTime: true,
            endTime: true,
            duration: true,
            isActive: true,
            userId: true
        },
        orderBy: {
            startTime: 'desc'
        }
    });

    res.json({
        success: true,
        data: sessions
    });
});

export const exportActivityData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, format = 'json' } = req.body;

    const whereClause = {
        userId,
        ...(startDate && endDate && {
            timestamp: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        })
    };

    const activities = await prisma.userActivityLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        select: {
            activityType: true,
            description: true,
            timestamp: true,
            ipAddress: true,
            userAgent: true,
            metadata: true
        }
    });

    // Log export activity
    await prisma.userActivityLog.create({
        data: {
            userId,
            activityType: 'ACTIVITY_DATA_EXPORT',
            description: 'Activity data exported',
            metadata: { startDate, endDate, format }
        }
    });

    switch (format) {
        case 'csv':
            return exportToCSV(res, activities);
        case 'excel':
            return await exportToExcel(res, activities);
        case 'pdf':
            return exportToPDF(res, activities);
        default:
            return res.json({
                success: true,
                data: activities
            });
    }
});

/**
 * Convert data to CSV and send as a response
 */
const exportToCSV = (res, data) => {
    const fields = ['activityType', 'description', 'timestamp', 'ipAddress', 'userAgent'];
    const csvParser = new Json2CsvParser({ fields });
    const csv = csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}-activity-log.csv`);
    res.status(200).send(csv);
};

/**
 * Convert data to Excel and send as a response
 */
const exportToExcel = async (res, data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activity Log');

    // Add headers
    worksheet.columns = [
        { header: 'Activity Type', key: 'activityType', width: 20 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Timestamp', key: 'timestamp', width: 25 },
        { header: 'IP Address', key: 'ipAddress', width: 20 },
        { header: 'User Agent', key: 'userAgent', width: 40 }
    ];

    // Add rows
    data.forEach(item => {
        worksheet.addRow(item);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}-activity-log.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

/**
 * Convert data to PDF and send as a response
 */
const exportToPDF = (res, data) => {
    const doc = new PDFDocument();
    const filePath = path.join(process.cwd(), 'tmp', `${Date.now()}-activity-log.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('User Activity Log', { align: 'center' }).moveDown();
    doc.fontSize(12);

    data.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.activityType}`);
        doc.text(`   Description: ${item.description}`);
        doc.text(`   Timestamp: ${item.timestamp}`);
        doc.text(`   IP Address: ${item.ipAddress}`);
        doc.text(`   User Agent: ${item.userAgent}`);
        doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => {
        res.download(filePath, `${Date.now()}-activity-log.pdf`, () => {
            fs.unlinkSync(filePath); // Clean up after download
        });
    });
};

// Add real-time activity tracking
export const trackActivity = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const activityData = req.body;

    try {
        // Create activity log
        const activity = await prisma.userActivityLog.create({
            data: {
                userId,
                ...activityData
            }
        });

        // Notify via WebSocket
        userWebSocketService.notifyUser(userId, {
            type: 'ACTIVITY_UPDATED',
            data: activity
        });

        res.json({
            success: true,
            message: 'Activity tracked successfully',
            data: activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to track activity'
        });
    }
}); 