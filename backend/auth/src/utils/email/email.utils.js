import nodemailer from 'nodemailer';
import { generateEmailTemplate } from './template.utils.js';
import logger from '../../logger/index.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    const template = generateEmailTemplate('verification', {
        verificationLink,
        expiresIn: '24 hours'
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Verify Your Email Address',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Verification email sent', { email });
    } catch (error) {
        logger.error('Failed to send verification email', { error, email });
        throw new Error('Failed to send verification email');
    }
};

export const sendAccountDeletionEmail = async (email, { gracePeriodDays, cancellationLink }) => {
    const template = generateEmailTemplate('account-deletion', {
        gracePeriodDays,
        cancellationLink,
        deletionDate: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000)
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Account Deletion Request',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Account deletion email sent', { email });
    } catch (error) {
        logger.error('Failed to send account deletion email', { error, email });
        throw new Error('Failed to send account deletion email');
    }
};

export const sendSecurityAlert = async (email, alertData) => {
    const template = generateEmailTemplate('security-alert', {
        ...alertData,
        securitySettingsLink: `${process.env.APP_URL}/settings/security`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Security Alert: ${alertData.activityType}`,
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Security alert email sent', { email, alertType: alertData.activityType });
    } catch (error) {
        logger.error('Failed to send security alert email', { error, email });
        throw new Error('Failed to send security alert email');
    }
};

export const sendPasswordChangedEmail = async (email, changeData) => {
    const template = generateEmailTemplate('password-changed', {
        ...changeData,
        supportLink: `${process.env.APP_URL}/support`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Changed Successfully',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Password change notification sent', { email });
    } catch (error) {
        logger.error('Failed to send password change email', { error, email });
        throw new Error('Failed to send password change email');
    }
};

export const sendTwoFactorEnabledEmail = async (email, tfaData) => {
    const template = generateEmailTemplate('two-factor-enabled', {
        ...tfaData,
        securitySettingsLink: `${process.env.APP_URL}/settings/security`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Two-Factor Authentication Enabled',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('2FA enabled notification sent', { email });
    } catch (error) {
        logger.error('Failed to send 2FA enabled email', { error, email });
        throw new Error('Failed to send 2FA enabled email');
    }
};

export const sendSubscriptionUpdateEmail = async (email, subscriptionData) => {
    const template = generateEmailTemplate('subscription-update', {
        ...subscriptionData,
        billingPortalLink: `${process.env.APP_URL}/settings/billing`,
        effectiveDate: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Subscription ${subscriptionData.action}`,
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Subscription update notification sent', { email, action: subscriptionData.action });
    } catch (error) {
        logger.error('Failed to send subscription update email', { error, email });
        throw new Error('Failed to send subscription update email');
    }
};

export const sendPasswordResetEmail = async (email, { resetToken, expiresIn }) => {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    const template = generateEmailTemplate('password-reset', {
        resetLink,
        expiresIn
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset Your Password',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Password reset email sent', { email });
    } catch (error) {
        logger.error('Failed to send password reset email', { error, email });
        throw new Error('Failed to send password reset email');
    }
};

export const sendBackupCodesEmail = async (email, { deviceInfo }) => {
    const template = generateEmailTemplate('backup-codes-generated', {
        deviceInfo,
        timestamp: new Date().toISOString(),
        securitySettingsLink: `${process.env.APP_URL}/settings/security`
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'New Backup Codes Generated',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Backup codes notification sent', { email });
    } catch (error) {
        logger.error('Failed to send backup codes email', { error, email });
        throw new Error('Failed to send backup codes email');
    }
};

export const sendAccountRecoveryEmail = async (email, recoveryData) => {
    const template = generateEmailTemplate('account-recovery', {
        ...recoveryData,
        recoveryLink: `${process.env.APP_URL}/account/recover?token=${recoveryData.token}`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Account Recovery Request',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Account recovery email sent', { email });
    } catch (error) {
        logger.error('Failed to send account recovery email', { error, email });
        throw new Error('Failed to send account recovery email');
    }
};

export const sendDeviceRemovedEmail = async (email, deviceData) => {
    const template = generateEmailTemplate('device-removed', {
        ...deviceData,
        securitySettingsLink: `${process.env.APP_URL}/settings/security`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Device Removed from Account',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Device removal notification sent', { email });
    } catch (error) {
        logger.error('Failed to send device removal email', { error, email });
        throw new Error('Failed to send device removal email');
    }
};

export const sendPaymentFailedEmail = async (email, paymentData) => {
    const template = generateEmailTemplate('payment-failed', {
        ...paymentData,
        billingPortalLink: `${process.env.APP_URL}/settings/billing`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Payment Failed - Action Required',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Payment failed notification sent', { email });
    } catch (error) {
        logger.error('Failed to send payment failed email', { error, email });
        throw new Error('Failed to send payment failed email');
    }
};

export const sendSubscriptionExpiringEmail = async (email, subscriptionData) => {
    const template = generateEmailTemplate('subscription-expiring', {
        ...subscriptionData,
        renewalLink: `${process.env.APP_URL}/settings/billing/renew`,
        expiryDate: new Date(subscriptionData.expiryDate).toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Subscription Expiring Soon',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Subscription expiring notification sent', { email });
    } catch (error) {
        logger.error('Failed to send subscription expiring email', { error, email });
        throw new Error('Failed to send subscription expiring email');
    }
};

export const sendProfileUpdatedEmail = async (email, updateData) => {
    const template = generateEmailTemplate('profile-updated', {
        ...updateData,
        securitySettingsLink: `${process.env.APP_URL}/settings/security`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Profile Changes Detected',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Profile update notification sent', { email });
    } catch (error) {
        logger.error('Failed to send profile update email', { error, email });
        throw new Error('Failed to send profile update email');
    }
};

export const sendAccountLockedEmail = async (email, lockData) => {
    const template = generateEmailTemplate('account-locked', {
        ...lockData,
        unlockLink: `${process.env.APP_URL}/account/unlock?token=${lockData.unlockToken}`,
        timestamp: new Date().toISOString()
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Account Temporarily Locked',
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Account locked notification sent', { email });
    } catch (error) {
        logger.error('Failed to send account locked email', { error, email });
        throw new Error('Failed to send account locked email');
    }
}; 