import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import prisma from '../utils/database/prisma.js';
import authUtils from '../utils/auth/auth.utils.js';

class UserWebSocketService {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.clients = new Map(); // Store client connections
        this.initialize();
    }

    initialize() {
        this.wss.on('connection', async (ws, req) => {
            try {
                // Authenticate connection
                const token = req.headers['sec-websocket-protocol'];
                const user = await authUtils.verifyToken(token);
                
                if (!user) {
                    ws.close(4001, 'Unauthorized');
                    return;
                }

                // Store client connection
                this.clients.set(user.id, ws);

                // Setup event handlers
                this.setupEventHandlers(ws, user.id);

                // Send initial data
                this.sendInitialData(ws, user.id);

            } catch (error) {
                console.error('WebSocket connection error:', error);
                ws.close(4000, 'Connection error');
            }
        });
    }

    setupEventHandlers(ws, userId) {
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                switch (data.type) {
                    case 'ACTIVITY_UPDATE':
                        await this.handleActivityUpdate(userId, data);
                        break;
                    case 'SECURITY_EVENT':
                        await this.handleSecurityEvent(userId, data);
                        break;
                    case 'NOTIFICATION_UPDATE':
                        await this.handleNotificationUpdate(userId, data);
                        break;
                }
            } catch (error) {
                console.error('Message handling error:', error);
            }
        });

        ws.on('close', () => {
            this.clients.delete(userId);
        });
    }

    async sendInitialData(ws, userId) {
        try {
            const [
                notifications,
                securityAlerts,
                activeDevices
            ] = await Promise.all([
                prisma.notification.findMany({
                    where: { userId, read: false }
                }),
                prisma.securityAlert.findMany({
                    where: { userId, resolved: false }
                }),
                prisma.userSession.findMany({
                    where: { userId, isActive: true }
                })
            ]);

            ws.send(JSON.stringify({
                type: 'INITIAL_DATA',
                data: {
                    notifications,
                    securityAlerts,
                    activeDevices
                }
            }));
        } catch (error) {
            console.error('Error sending initial data:', error);
        }
    }

    // Real-time event handlers
    async handleActivityUpdate(userId, data) {
        // Update activity log and notify relevant clients
        await prisma.userActivityLog.create({
            data: {
                userId,
                activityType: data.activityType,
                description: data.description,
                metadata: data.metadata
            }
        });

        this.notifyUser(userId, {
            type: 'ACTIVITY_UPDATED',
            data: data
        });
    }

    async handleSecurityEvent(userId, data) {
        // Handle security events and notify user
        await prisma.securityLog.create({
            data: {
                userId,
                eventType: data.eventType,
                severity: data.severity,
                description: data.description
            }
        });

        this.notifyUser(userId, {
            type: 'SECURITY_ALERT',
            data: data
        });
    }

    async handleNotificationUpdate(userId, data) {
        // Handle notification updates
        await prisma.notification.update({
            where: { id: data.notificationId },
            data: { read: data.read }
        });

        this.notifyUser(userId, {
            type: 'NOTIFICATION_UPDATED',
            data: data
        });
    }

    notifyUser(userId, data) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    }

    broadcastToAll(data) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    async close() {
        // Close all client connections
        for (const [userId, client] of this.clients.entries()) {
            if (client.readyState === WebSocket.OPEN) {
                client.close(1000, 'Server shutting down');
            }
        }
        
        // Clear clients map
        this.clients.clear();
        
        // Close WebSocket server
        if (this.wss) {
            await new Promise((resolve, reject) => {
                this.wss.close(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }
}

export default UserWebSocketService; 