import dotenv from 'dotenv';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import prisma from './utils/database/prisma.js';
import logger from './utils/logger/logger.js';
import express from 'express';
import routes from './routes/index.js';
import UserWebSocketService from './websocket/user.socket.js';
import { 
    initializeDatabases,
    testDbConnection
} from './utils/database/database.utils.js';
import { createServer } from 'http';
import socketService from './services/websocket/socket.service.js';
import { createSuperAdmin } from './command/payload.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const API_VERSION = process.env.API_VERSION || 'v1';

// Create Express app
const app = express();
const server = createServer(app);

// Initialize socket service
socketService.initialize(server);

// Trust proxy settings
app.enable('trust proxy');

// Mount routes
app.use('/', routes);

let userWebSocketService;
let isShuttingDown = false; // Flag to track shutdown state

// Initialize databases and start server
const startServer = async () => {
    try {
        // Clear console for clean output
        console.clear();

        // Fancy banner
        const banner = `
          ╔═══════════════════════════════════════════╗
          ║             Authentication API            ║
          ╚═══════════════════════════════════════════╝
`;
        console.log('\x1b[36m%s\x1b[0m', banner);  // Cyan color

        console.log('\x1b[32m%s\x1b[0m', '\t\t✓ Server started successfully ☘️ \n');  // Green color

        // Initialize databases
        await initializeDatabases();
        await testDbConnection();

        // Start server on fixed port
        server.listen(PORT, async () => {
            // Server info
            console.log('\x1b[32m%s\x1b[0m', '✓ Server Status');  // Green color
            console.log('  • Environment:', process.env.NODE_ENV);
            console.log('  • Port:', PORT);
            console.log('  • API Version:', API_VERSION);
            
            console.log('\n\x1b[32m%s\x1b[0m', '✓ API Documentation');  // Green color
            console.log('  • JSON Format:', `http://localhost:${PORT}/api/${API_VERSION}/endpoints`);
            console.log('  • HTML Format:', `http://localhost:${PORT}/api/${API_VERSION}/docs`);
            console.log('  • Health Check:', `http://localhost:${PORT}/api/${API_VERSION}/health`);
            
            console.log('\n\x1b[33m%s\x1b[0m', 'Press Ctrl+C to stop the server\n');  // Yellow color

            // Create super admin after server is running
            try {
                console.log('\x1b[36m%s\x1b[0m', 'Creating super admin account...');
                await createSuperAdmin();
                console.log('\x1b[32m%s\x1b[0m', '✓ Super admin account created successfully');
            } catch (error) {
                console.error('\x1b[31m%s\x1b[0m', '✗ Failed to create super admin:', error.message);
            }
        });

        // Initialize WebSocket service after server starts
        userWebSocketService = new UserWebSocketService(server);

        // Enable keep-alive connections
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;

        return server;
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '\n✗ Failed to start server');  // Red color
        console.error('  Error:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
        console.log('\x1b[33m%s\x1b[0m', 'Shutdown already in progress...');
        return;
    }
    
    isShuttingDown = true;
    
    try {
        console.log('\x1b[33m%s\x1b[0m', 'Received shutdown signal. Starting graceful shutdown...');  // Yellow color

        // Close WebSocket connections
        if (userWebSocketService) {
            await userWebSocketService.close();
            console.log('\x1b[32m%s\x1b[0m', '✓ WebSocket connections closed');
        }

        if (server) {
            await new Promise((resolve) => {
                // Set a timeout for forceful shutdown
                const forceShutdown = setTimeout(() => {
                    console.log('\x1b[31m%s\x1b[0m', '! Forcing server shutdown after timeout');
                    resolve();
                }, 30000); // 30 seconds timeout

                server.close((err) => {
                    clearTimeout(forceShutdown);
                    if (err) {
                        console.error('\x1b[31m%s\x1b[0m', '✗ Error closing server');  // Red color
                        logger.error('Error closing server:', err);
                    } else {
                        console.log('\x1b[32m%s\x1b[0m', '✓ Server closed successfully');  // Green color
                    }
                    resolve();
                });
            });
        }

        // Close database connection
        await prisma.$disconnect();
        console.log('\x1b[32m%s\x1b[0m', '✓ Database connections closed');  // Green color
        
        console.log('\x1b[32m%s\x1b[0m', '✓ Graceful shutdown completed\n');  // Green color
        process.exit(0);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error during graceful shutdown:', error);  // Red color
        process.exit(1);
    }
};

// Handle process signals for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    // Only trigger shutdown if it's a fatal error
    if (error.fatal) {
        logger.error('Fatal Uncaught Exception:', error);
        gracefulShutdown();
    } else {
        logger.error('Non-fatal Uncaught Exception:', error);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    // Only log the error without triggering shutdown
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

// Export WebSocket service for use in other parts of the application
export { 
    userWebSocketService
};
