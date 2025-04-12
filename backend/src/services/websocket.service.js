import { io } from '../server.js';

export class WebSocketService {
    static notifyUser(userId, data) {
        io.to(userId).emit('notification', data);
    }

    static notifyLogin(userId, loginData) {
        io.to(userId).emit('loginActivity', loginData);
    }

    static notifySecurityEvent(userId, eventData) {
        io.to(userId).emit('securityAlert', eventData);
    }
}