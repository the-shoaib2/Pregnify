import transporter from './config/email_transporter.js';
import { welcomeTemplate } from './templates/welcome.template.js';
import passwordResetTemplate from './templates/password_reset.template.js';
import loginNotificationTemplate from './templates/login_notification.template.js';
import logoutNotificationTemplate from './templates/logout_notification.template.js';
import accountRecoveryTemplate from './templates/account_recovery.template.js';
import accountDeletionTemplate from './templates/account_deletion.template.js';
import { twoFactorSetupCompleteTemplate } from './templates/2fa/setup_complete.template.js';
import { twoFactorDisabledTemplate } from './templates/2fa/disabled.template.js';
import { newDeviceTwoFactorTemplate } from './templates/2fa/new_device.template.js';
import passwordResetCodeTemplate from './templates/password_reset_code.template.js';
import passwordChangeNotificationTemplate from './templates/password_change_notification.template.js';
import passwordResetLinkTemplate from './templates/password_reset_link.template.js';
import { formatDuration } from '../utils/date.utils.js';

class EmailService {
    constructor() {
        this.transporter = transporter;
        this.from = process.env.SMTP_FROM;
        
        // Pre-compile templates for better performance
        this.compiledTemplates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Pre-compile all templates
        this.compiledTemplates.set('welcome', welcomeTemplate);
        this.compiledTemplates.set('login_notification', loginNotificationTemplate);
        this.compiledTemplates.set('logout_notification', logoutNotificationTemplate);
        this.compiledTemplates.set('account_recovery', accountRecoveryTemplate);
        this.compiledTemplates.set('account_deletion', accountDeletionTemplate);
        this.compiledTemplates.set('two_factor_setup', twoFactorSetupCompleteTemplate);
        this.compiledTemplates.set('two_factor_disabled', twoFactorDisabledTemplate);
        this.compiledTemplates.set('new_device', newDeviceTwoFactorTemplate);
        this.compiledTemplates.set('password_reset_code', passwordResetCodeTemplate);
        this.compiledTemplates.set('password_reset', passwordResetTemplate);
        // ... other templates
    }

    getTemplate(name) {
        const template = this.compiledTemplates.get(name);
        if (!template) {
            throw new Error(`Template ${name} not found`);
        }
        return template;
    }

    async sendEmail(to, subject, html, options = {}) {
        if (!to) {
            throw new Error('Recipient email is required');
        }

        // Ensure to is properly formatted
        const formattedTo = Array.isArray(to) ? to.join(',') : to;

        const mailOptions = {
            from: this.from,
            to: formattedTo,
            subject,
            html,
            priority: options.priority || 'normal',
            headers: {
                'X-Priority': options.priority === 'high' ? '1' : '3'
            }
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            if (process.env.NODE_ENV === 'development') {
                console.log('Email sent:', {
                    messageId: info.messageId,
                    to,
                    subject
                });
            }
            return info;
        } catch (error) {
            console.error('Email sending failed:', {
                error: error.message,
                to,
                subject
            });
            throw error;
        }
    }

    /**
     * Sends welcome email to newly registered users
     * @param {string} email - User's email address
     * @param {string} name - User's name
     * @param {string} verificationLink - Email verification link
     * @returns {Promise<void>}
     */
    async sendWelcomeEmail(email, name, verificationLink) {
        try {
            const emailData = {
                name,
                verificationLink
            };

            const html = welcomeTemplate.getHtml(emailData);
            const subject = welcomeTemplate.getSubject(name);

            await this.sendEmail(email, subject, html);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email, name, resetLink) {
        const subject = 'Password Reset Request';
        const html = this.getTemplate('password_reset', { name, resetLink });
        return this.sendEmail(email, subject, html);
    }

    async sendLoginNotificationEmail(user, loginDetails) {
        try {
            if (!user || !user.email || !loginDetails) {
                console.error('Invalid user or login details provided to sendLoginNotificationEmail');
                return false;
            }

            const enrichedLoginDetails = {
                ...loginDetails,
                location: await this.getLocationFromIP(loginDetails.ip || 'unknown'),
                time: loginDetails.time || new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                    timeZone: user.timezone || 'UTC'
                })
            };

            const html = loginNotificationTemplate(
                user,
                enrichedLoginDetails
            );
            
            await this.transporter.sendMail({
                from: this.from,
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
            if (!user || !user.email || !logoutDetails) {
                console.error('Invalid user or logout details provided to sendLogoutNotificationEmail');
                return false;
            }

            const enrichedLogoutDetails = {
                ...logoutDetails,
                location: await this.getLocationFromIP(logoutDetails.ip || 'unknown'),
                time: logoutDetails.time || new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                    timeZone: user.timezone || 'UTC'
                }),
                sessionDuration: logoutDetails.loginTime && logoutDetails.logoutTime ? 
                    formatDuration(
                        new Date(logoutDetails.loginTime),
                        new Date(logoutDetails.logoutTime)
                    ) : 'Unknown duration'
            };

            const html = logoutNotificationTemplate(
                user.firstName || user.name || 'User', 
                enrichedLogoutDetails
            );
            
            await this.transporter.sendMail({
                from: this.from,
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
        // Implement IP geolocation logic here
        return 'Location information unavailable';
    }

    async sendAccountRecoveryEmail(user, recoveryLink) {
        const subject = 'Account Recovery Request';
        const html = this.getTemplate('account_recovery', { user, recoveryLink });
        return this.sendEmail(user.email, subject, html);
    }

    async sendAccountDeletionEmail(user, deletionDetails) {
        const subject = 'Account Deletion Confirmation';
        const html = this.getTemplate('account_deletion', { user, deletionDetails });
        return this.sendEmail(user.email, subject, html);
    }

    async send2FASetupEmail(user, method) {
        const subject = 'Two-Factor Authentication Enabled';
        const html = this.getTemplate('two_factor_setup', { user, method });
        return this.sendEmail(user.email, subject, html);
    }

    async send2FADisabledEmail(user) {
        const subject = 'Two-Factor Authentication Disabled';
        const html = this.getTemplate('two_factor_disabled', { user });
        return this.sendEmail(user.email, subject, html);
    }

    async sendNewTrustedDeviceEmail(user, deviceInfo) {
        const subject = 'New Trusted Device Added';
        const html = this.getTemplate('new_device', {
            ...deviceInfo,
            timestamp: new Date().toLocaleString()
        });
        return this.sendEmail(user.email, subject, html);
    }

    async send2FABackupCodesEmail(user, backupCodes) {
        const subject = 'Your 2FA Backup Codes';
        const html = `
            <h2>Your Backup Codes</h2>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Here are your backup codes for two-factor authentication:</p>
            <pre>${backupCodes.join('\n')}</pre>
            <p>Keep these codes safe and secure. Each code can only be used once.</p>
        `;
        return this.sendEmail(user.email, subject, html);
    }

    async sendPasswordResetCode(email, name, code, options = {}) {
        const subject = 'Password Reset Code';
        const html = this.getTemplate('password_reset_code', { name, code });
        return this.sendEmail(email, subject, html, options);
    }

    async sendPasswordChangeNotification(email, name) {
        const subject = 'Password Changed Successfully';
        const html = passwordChangeNotificationTemplate(name);
        return this.sendEmail(email, subject, html, { priority: 'high' });
    }

    async sendPasswordResetLink(email, firstName, resetLink, options = {}) {
        const subject = 'Reset Your Password';
        const html = passwordResetLinkTemplate(firstName, resetLink);

        try {
            return await this.sendEmail(email, subject, html, {
                priority: 'high',
                ...options
            });
        } catch (error) {
            console.error('Failed to send password reset link:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();
