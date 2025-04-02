import Handlebars from 'handlebars';

const templates = {
    verification: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Verify Your Email Address</h1>
            <p>Please click the button below to verify your email address. This link will expire in {{expiresIn}}.</p>
            <a href="{{verificationLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                Verify Email
            </a>
            <p style="margin-top: 20px;">
                If the button doesn't work, you can also copy and paste this link into your browser:
                <br>
                <span style="color: #666;">{{verificationLink}}</span>
            </p>
        </div>
    `,

    'account-deletion': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Account Deletion Request</h1>
            <p>We've received your request to delete your account. Your account is scheduled for deletion on {{deletionDate}}.</p>
            <p>You have {{gracePeriodDays}} days to cancel this request if you change your mind.</p>
            <a href="{{cancellationLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Cancel Deletion
            </a>
            <p style="margin-top: 20px;">
                If you did not request this deletion, please click the button above immediately or contact our support team.
            </p>
        </div>
    `,

    'security-alert': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Security Alert</h1>
            <p>We detected a {{activityType}} from a new device:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Device:</strong> {{deviceInfo}}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> {{location}}</p>
                <p style="margin: 5px 0;"><strong>IP Address:</strong> {{ipAddress}}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> {{timestamp}}</p>
            </div>
            <p>If this wasn't you, please secure your account:</p>
            <a href="{{securitySettingsLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Review Account Security
            </a>
        </div>
    `,

    'password-changed': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Password Changed Successfully</h1>
            <p>Your account password was recently changed. This change was made on:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Date:</strong> {{timestamp}}</p>
                <p><strong>Device:</strong> {{deviceInfo}}</p>
            </div>
            <p>If you didn't make this change, please contact us immediately:</p>
            <a href="{{supportLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Contact Support
            </a>
        </div>
    `,

    'two-factor-enabled': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Two-Factor Authentication Enabled</h1>
            <p>Two-factor authentication has been successfully enabled for your account.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Method:</strong> {{method}}</p>
                <p><strong>Enabled On:</strong> {{timestamp}}</p>
            </div>
            <p>Your account is now more secure. Remember to keep your backup codes in a safe place.</p>
            <a href="{{securitySettingsLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                Manage Security Settings
            </a>
        </div>
    `,

    'subscription-update': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Subscription Update</h1>
            <p>Your subscription has been {{action}}.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Status:</strong> {{status}}</p>
                <p><strong>Effective Date:</strong> {{effectiveDate}}</p>
                {{#if nextBillingDate}}
                <p><strong>Next Billing:</strong> {{nextBillingDate}}</p>
                {{/if}}
            </div>
            <a href="{{billingPortalLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">
                Manage Subscription
            </a>
        </div>
    `,

    'password-reset': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Reset Password
            </a>
            <p style="margin-top: 20px;">This link will expire in {{expiresIn}}.</p>
            <p style="color: #666;">
                If you didn't request this reset, you can safely ignore this email. Your password won't be changed.
            </p>
        </div>
    `,

    'backup-codes-generated': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>New Backup Codes Generated</h1>
            <p>New backup codes have been generated for your account.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Generated On:</strong> {{timestamp}}</p>
                <p><strong>Device:</strong> {{deviceInfo}}</p>
            </div>
            <p>Previous backup codes are no longer valid. Make sure to save your new codes in a secure location.</p>
            <a href="{{securitySettingsLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                View Security Settings
            </a>
        </div>
    `,

    'account-recovery': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Account Recovery Request</h1>
            <p>We received a request to recover access to your account. Click below to start the recovery process:</p>
            <a href="{{recoveryLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Recover Account
            </a>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Request Time:</strong> {{timestamp}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Device:</strong> {{deviceInfo}}</p>
            </div>
            <p style="color: #666;">
                If you didn't request account recovery, please secure your account immediately.
            </p>
        </div>
    `,

    'device-removed': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Device Removed from Account</h1>
            <p>A device has been removed from your trusted devices list:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Device:</strong> {{deviceInfo}}</p>
                <p><strong>Last Used:</strong> {{lastUsed}}</p>
                <p><strong>Removed On:</strong> {{timestamp}}</p>
            </div>
            <p>If you didn't remove this device, please review your account security:</p>
            <a href="{{securitySettingsLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Review Security Settings
            </a>
        </div>
    `,

    'payment-failed': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Payment Failed</h1>
            <p>We were unable to process your payment for the following subscription:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Amount:</strong> {{amount}}</p>
                <p><strong>Date:</strong> {{timestamp}}</p>
                <p><strong>Reason:</strong> {{failureReason}}</p>
            </div>
            <p>Please update your payment method to avoid service interruption:</p>
            <a href="{{billingPortalLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Update Payment Method
            </a>
            <p style="margin-top: 20px; color: #666;">
                We will attempt to charge your account again in {{retryIn}}.
            </p>
        </div>
    `,

    'subscription-expiring': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Subscription Expiring Soon</h1>
            <p>Your subscription will expire in {{daysLeft}} days:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Expires On:</strong> {{expiryDate}}</p>
                <p><strong>Auto-renewal:</strong> {{autoRenewal}}</p>
            </div>
            {{#if autoRenewal}}
            <p>Your subscription will be automatically renewed on {{renewalDate}}.</p>
            {{else}}
            <p>To continue using our services, please renew your subscription:</p>
            <a href="{{renewalLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                Renew Subscription
            </a>
            {{/if}}
        </div>
    `,

    'profile-updated': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Profile Changes Detected</h1>
            <p>The following changes were made to your profile:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                {{#each changes}}
                <p><strong>{{@key}}:</strong> Changed from "{{this.old}}" to "{{this.new}}"</p>
                {{/each}}
                <p style="margin-top: 10px;"><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Device:</strong> {{deviceInfo}}</p>
            </div>
            <p>If you didn't make these changes, please secure your account:</p>
            <a href="{{securitySettingsLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">
                Review Security Settings
            </a>
        </div>
    `,

    'account-locked': `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Account Temporarily Locked</h1>
            <p>Your account has been temporarily locked due to {{reason}}.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Duration:</strong> {{lockDuration}}</p>
            </div>
            <p>To unlock your account immediately, verify your identity:</p>
            <a href="{{unlockLink}}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">
                Verify Identity
            </a>
            <p style="margin-top: 20px; color: #666;">
                If you need assistance, please contact our support team.
            </p>
        </div>
    `
};

// Precompile templates
const compiledTemplates = Object.entries(templates).reduce((acc, [name, template]) => {
    acc[name] = Handlebars.compile(template);
    return acc;
}, {});

export const generateEmailTemplate = (templateName, data) => {
    const template = compiledTemplates[templateName];
    if (!template) {
        throw new Error(`Template "${templateName}" not found`);
    }
    return template(data);
};

// Add helper functions for date formatting
Handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Add more Handlebars helpers
Handlebars.registerHelper('timeAgo', function(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
});

Handlebars.registerHelper('currency', function(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
});

Handlebars.registerHelper('pluralize', function(number, singular, plural) {
    return number === 1 ? singular : (plural || singular + 's');
}); 


export default generateEmailTemplate;