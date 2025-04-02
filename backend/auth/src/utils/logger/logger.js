import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

// Constants
const LOG_DIR = 'logs';
const LOG_RETENTION_HOURS = 1;
const MAX_SIZE = '10m';
const MAX_FILES = '14d';

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Auto-delete old log files
const cleanOldLogs = () => {
    fs.readdir(LOG_DIR, (err, files) => {
        if (err) {
            console.error('Error reading logs directory:', err);
            return;
        }

        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(LOG_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                // Delete files older than LOG_RETENTION_HOURS
                if (now - stats.mtime.getTime() > LOG_RETENTION_HOURS * 60 * 60 * 1000) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error('Error deleting old log file:', err);
                        }
                    });
                }
            });
        });
    });
};

// Create logger with daily rotate file
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: process.env.APP_NAME },
    transports: [
        // Error logs
        new winston.transports.DailyRotateFile({
            filename: `${LOG_DIR}/error-%DATE%.log`,
            datePattern: 'YYYY-MM-DD-HH',
            maxSize: MAX_SIZE,
            maxFiles: MAX_FILES,
            level: 'error'
        }),
        // Combined logs
        new winston.transports.DailyRotateFile({
            filename: `${LOG_DIR}/combined-%DATE%.log`,
            datePattern: 'YYYY-MM-DD-HH',
            maxSize: MAX_SIZE,
            maxFiles: MAX_FILES
        })
    ]
});

// Add console transport in non-development environments
if (process.env.NODE_ENV !== 'development') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Run cleanup every hour
setInterval(cleanOldLogs, 60 * 60 * 1000);
// Initial cleanup
cleanOldLogs();

export default logger;
