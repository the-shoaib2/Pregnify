import { baseEmailTemplate } from './utils/base.template.js';

/**
 * Generates HTML for welcome email
 * @param {Object} data - Data for the email template
 * @param {string} data.name - User's name
 * @param {string} data.verificationLink - Email verification link
 * @returns {string} HTML string for the email
 */
export const welcomeTemplate = {
    getHtml: (data) => {
        const { name, verificationLink } = data;

        const content = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Welcome to Our Platform!</h2>
                
                <p style="font-size: 16px; color: #666;">
                    Hi ${name},
                </p>
                
                <p style="font-size: 16px; color: #666;">
                    Thank you for joining us! We're excited to have you as part of our community.
                </p>
                
                <p style="font-size: 16px; color: #666;">
                    To get started, please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #4CAF50; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-size: 16px;">
                        Verify Email
                    </a>
                </div>
                
                <p style="font-size: 16px; color: #666;">
                    If the button doesn't work, you can also copy and paste this link into your browser:
                    <br>
                    <a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a>
                </p>
                
                <p style="font-size: 16px; color: #666;">
                    If you didn't create an account, you can safely ignore this email.
                </p>
                
                <p style="font-size: 16px; color: #666;">
                    Best regards,<br>
                    The Team
                </p>
            </div>
        `;

        return baseEmailTemplate(content);
    },

    getSubject: (name) => {
        return `Welcome to Our Platform, ${name}!`;
    }
}; 