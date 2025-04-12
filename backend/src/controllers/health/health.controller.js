import asyncHandler from '../../utils/middleware/async.handler.js';
import ApiResponse from '../../utils/error/api.response.js';
import os from 'os';
import { formatDistanceToNow } from 'date-fns';
import prisma from '../../utils/database/prisma.js';
import { getAllEnums } from '../system/enum.controller.js';

// Check database connection
const checkDatabase = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'UP', message: 'Database connection is healthy' };
    } catch (error) {
        return { status: 'DOWN', message: 'Database connection failed', error: error.message };
    }
};

/**
 * Get detailed system information
 * @returns {Object} System information
 */
const getSystemInfo = () => {
    const startTime = new Date(Date.now() - process.uptime() * 1000);
    const uptime = formatDistanceToNow(startTime, { addSuffix: true });
    
    return {
        os: {
            type: os.type(),
            platform: os.platform(),
            arch: os.arch(),
            version: os.version(),
            release: os.release()
        },
        cpu: {
            model: os.cpus()[0].model,
            cores: os.cpus().length,
            speed: `${os.cpus()[0].speed} MHz`,
            load: os.loadavg()
        },
        memory: {
            total: `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
            free: `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
            used: `${((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(2)} GB`
        },
        process: {
            pid: process.pid,
            version: process.version,
            uptime: uptime,
            memoryUsage: process.memoryUsage(),
            env: process.env.NODE_ENV || 'development'
        }
    };
};

/**
 * Generate HTML response for health endpoints
 * @param {string} status - Health status (success/error)
 * @param {string} message - Status message
 * @param {Object} systemInfo - System information
 * @returns {string} HTML response
 */
const generateHtmlResponse = (status, message, systemInfo) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Health Status</title>
    <style>
        :root {
            --bg-color: #1a1a1a;
            --card-bg: #2d2d2d;
            --text-color: #e0e0e0;
            --border-color: #404040;
            --success-color: #4caf50;
            --error-color: #f44336;
            --accent-color: #2196f3;
        }
        
        @media (prefers-color-scheme: light) {
            :root {
                --bg-color: #f5f5f5;
                --card-bg: #ffffff;
                --text-color: #333333;
                --border-color: #e0e0e0;
                --success-color: #43a047;
                --error-color: #e53935;
                --accent-color: #1e88e5;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            transition: all 0.3s ease;
        }
        
        .container {
            background-color: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            padding: 2rem;
            width: 100%;
            max-width: 800px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }
        
        .status {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: ${status === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
        }
        
        .message {
            font-size: 1.2rem;
            color: var(--text-color);
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .card {
            background-color: var(--bg-color);
            border-radius: 8px;
            padding: 1.5rem;
        }
        
        .card h3 {
            color: var(--accent-color);
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }
        
        .info-label {
            color: var(--text-color);
            opacity: 0.7;
        }
        
        .info-value {
            font-weight: 500;
        }
        
        .timestamp {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: var(--text-color);
            opacity: 0.6;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 1rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status">
                ${status === 'success' ? '✅' : '❌'} 
                ${status.toUpperCase()}
            </div>
            <div class="message">${message}</div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>🖥️ Operating System</h3>
                <div class="info-item">
                    <span class="info-label">Type</span>
                    <span class="info-value">${systemInfo.os.type}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Platform</span>
                    <span class="info-value">${systemInfo.os.platform}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version</span>
                    <span class="info-value">${systemInfo.os.version}</span>
                </div>
            </div>
            
            <div class="card">
                <h3>⚡ CPU & Memory</h3>
                <div class="info-item">
                    <span class="info-label">CPU Model</span>
                    <span class="info-value">${systemInfo.cpu.model}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cores</span>
                    <span class="info-value">${systemInfo.cpu.cores}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Memory Used</span>
                    <span class="info-value">${systemInfo.memory.used}</span>
                </div>
            </div>
            
            <div class="card">
                <h3>🚀 Process Info</h3>
                <div class="info-item">
                    <span class="info-label">Node Version</span>
                    <span class="info-value">${systemInfo.process.version}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Process ID</span>
                    <span class="info-value">${systemInfo.process.pid}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Uptime</span>
                    <span class="info-value">${systemInfo.process.uptime}</span>
                </div>
            </div>
        </div>
        
        <div class="timestamp">
            Last checked: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
`;

/**
 * @description Health check endpoint that returns both HTML and JSON responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const healthCheck = asyncHandler(async (req, res) => {
    const dbStatus = await checkDatabase();
    const systemInfo = getSystemInfo();
    const status = dbStatus.status === 'UP' ? 'success' : 'error';
    const message = dbStatus.status === 'UP' ? 'System is healthy' : 'System check failed';

    if (req.headers.accept?.includes('text/html')) {
        res.setHeader('Content-Type', 'text/html');
        res.send(generateHtmlResponse(status, message, systemInfo, dbStatus));
    } else {
        res.status(dbStatus.status === 'UP' ? 200 : 503).json(
            new ApiResponse(200, {
                status,
                timestamp: new Date(),
                systemInfo,
                database: dbStatus
            }, message)
        );
    }
});




const appInfo = {
    name: process.env.APP_NAME || "Auth Service", // Fetch from env
    version: "1.0.0",
    description: "Auth Service",
    termsAndConditions: "process.env.FRONTEND_URL/terms",
    privacyPolicy: "process.env.FRONTEND_URL/privacy",
    contactEmail: "support@auth.com",
    supportPhone: "0000000000",
};

/**
 * @description Ping endpoint that returns both HTML and JSON responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const ping = asyncHandler(async (req, res) => {
    const systemInfo = getSystemInfo();
    
        res.status(200).json(
            new ApiResponse(200, {
                status: 'success',
                message: 'pong',
                timestamp: new Date(),
                systemInfo,
                appInfo
            })
        );
});

export default { healthCheck, ping };
