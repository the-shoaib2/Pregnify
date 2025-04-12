import loginNotificationTemplate from '../helpers/email/templates/login_notification.template.js';
import logoutNotificationTemplate from '../helpers/email/templates/logout_notification.template.js';
import { formatDuration } from '../utils/date.utils.js';

class EmailService {
    constructor(mailer) {
        this.mailer = mailer;
    }

    async sendLoginNotificationEmail(user, loginDetails) {
        try {
            const enrichedLoginDetails = {
                ...loginDetails,
                location: await this.getLocationFromIP(loginDetails.ip),
                time: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                    timeZone: user.timezone || 'UTC'
                })
            };

            const html = loginNotificationTemplate(user.name, enrichedLoginDetails);
            
            await this.mailer.sendMail({
                to: user.email,
                subject: 'New Login Detected - Security Alert',
                html,
                priority: 'high'
            });

            return true;
        } catch (error) {
            console.error('Failed to send login notification email:', error);
            return false;
        }
    }

    async sendLogoutNotificationEmail(user, logoutDetails) {
        try {
            const enrichedLogoutDetails = {
                ...logoutDetails,
                location: await this.getLocationFromIP(logoutDetails.ip),
                time: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                    timeZone: user.timezone || 'UTC'
                }),
                sessionDuration: formatDuration(
                    new Date(logoutDetails.loginTime),
                    new Date(logoutDetails.logoutTime)
                )
            };

            const html = logoutNotificationTemplate(user.name, enrichedLogoutDetails);
            
            await this.mailer.sendMail({
                to: user.email,
                subject: 'Account Logout Notification',
                html,
                priority: 'normal'
            });

            return true;
        } catch (error) {
            console.error('Failed to send logout notification email:', error);
            return false;
        }
    }

    async getLocationFromIP(ip) {
        try {
            // Implement IP geolocation logic here
            // You can use services like MaxMind, ipapi.co, etc.
            return 'Location information unavailable';
        } catch (error) {
            return 'Unknown location';
        }
    }
}

export default EmailService; 