import socketService from './socket.service.js';

class NotificationService {
    static notifyLogin(userId, loginData) {
        socketService.emit(userId, 'loginActivity', {
            type: 'LOGIN',
            ...loginData,
            timestamp: new Date()
        });
    }

    static notifyLogout(userId, logoutData) {
        socketService.emit(userId, 'logoutActivity', {
            type: 'LOGOUT',
            ...logoutData,
            timestamp: new Date()
        });
    }

    static notifySecurityEvent(userId, eventData) {
        socketService.emit(userId, 'securityAlert', {
            type: 'SECURITY_EVENT',
            ...eventData,
            timestamp: new Date()
        });
    }

    static notifyActivityUpdate(userId, activityData) {
        socketService.emit(userId, 'activityUpdate', {
            type: 'ACTIVITY_UPDATE',
            ...activityData,
            timestamp: new Date()
        });
    }

    static notifyProfileUpdate(userId, profileData) {
        socketService.emit(userId, 'profileUpdate', {
            type: 'PROFILE_UPDATE',
            ...profileData,
            timestamp: new Date()
        });
    }
}

export default NotificationService;