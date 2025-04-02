import { WebSocketServer } from 'ws';
import authUtils from '../../utils/auth/auth.utils.js';

class SocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.eventHandlers = new Map();
    }

    initialize(server) {
        if (this.wss) {
            return;
        }

        this.wss = new WebSocketServer({ server });
        
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

                // Setup message handler
                ws.on('message', (message) => this.handleMessage(user.id, message));

                // Setup close handler
                ws.on('close', () => {
                    this.clients.delete(user.id);
                    this.emit(user.id, 'status', { status: 'offline' });
                });

                // Send initial connection success
                this.emit(user.id, 'connected', { 
                    status: 'connected',
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('WebSocket connection error:', error);
                ws.close(4000, 'Connection error');
            }
        });
    }

    // Register event handlers
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    // Remove event handlers
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
    }

    // Emit event to specific user
    emit(userId, event, data) {
        const client = this.clients.get(userId);
        if (client && client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({
                event,
                data,
                timestamp: new Date()
            }));
        }
    }

    // Broadcast to all connected clients
    broadcast(event, data, excludeUserId = null) {
        this.clients.forEach((client, userId) => {
            if (userId !== excludeUserId && client.readyState === 1) {
                client.send(JSON.stringify({
                    event,
                    data,
                    timestamp: new Date()
                }));
            }
        });
    }

    // Handle incoming messages
    handleMessage(userId, message) {
        try {
            const { event, data } = JSON.parse(message);
            
            if (this.eventHandlers.has(event)) {
                this.eventHandlers.get(event).forEach(handler => {
                    handler(userId, data);
                });
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Notify specific user
    notifyUser(userId, type, data) {
        this.emit(userId, type, data);
    }

    // Get connected client count
    getConnectedClientsCount() {
        return this.clients.size;
    }

    // Check if user is connected
    isUserConnected(userId) {
        return this.clients.has(userId);
    }

    // Close all connections
    async close() {
        for (const [userId, client] of this.clients.entries()) {
            if (client.readyState === 1) {
                client.close(1000, 'Server shutting down');
            }
        }
        
        this.clients.clear();
        this.eventHandlers.clear();
        
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

// Create singleton instance
const socketService = new SocketService();

export default socketService;