import twilio from 'twilio';
import { HTTP_STATUS } from '../../constants/index.js';
import ApiError from '../../utils/error/api.error.js';
import logger from '../../utils/logger/logger.js';

class SMSService {
    constructor() {
        // For development, always enable the service
        this.isEnabled = true;
        logger.info('SMS service initialized in development mode');
    }

    async sendSMS(to, message, options = {}) {
        try {
            // Input validation
            if (!to || !message) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone number and message are required');
            }

            // Format and validate phone number
            const formattedNumber = this.formatPhoneNumber(to);
            
            // Log the mock SMS
            console.log('\n🚀 Development: SMS would be sent:', {
                to: formattedNumber,
                message,
                priority: options.priority || 'normal'
            });

            // Mock successful response
            return {
                sid: 'MOCK_' + Date.now(),
                status: 'delivered',
                to: formattedNumber,
                body: message
            };
        } catch (error) {
            this.handleSMSError(error, to);
        }
    }

    handleSMSError(error, phoneNumber) {
        logger.error('SMS error:', {
            message: error.message,
            phoneNumber: this.maskPhoneNumber(phoneNumber)
        });

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Failed to send SMS. Service not implemented yet.'
        );
    }

    formatPhoneNumber(phoneNumber) {
        try {
            if (!phoneNumber) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone number is required');
            }

            // Remove any non-digit characters
            const cleaned = phoneNumber.replace(/\D/g, '');
            
            // Validate length
            if (cleaned.length < 10 || cleaned.length > 13) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid phone number length. Expected 10-13 digits.'
                );
            }

            // Handle different formats
            if (cleaned.startsWith('880')) {
                return `+${cleaned}`;
            }
            
            if (cleaned.startsWith('0')) {
                return `+880${cleaned.substring(1)}`;
            }

            return `+880${cleaned}`;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'Invalid phone number format. Please use Bangladesh number format.'
            );
        }
    }

    maskPhoneNumber(phoneNumber) {
        try {
            if (!phoneNumber) return 'INVALID_NUMBER';
            return phoneNumber.replace(/(\+\d{4})\d{6}(\d{2})/, '$1******$2');
        } catch (error) {
            return 'INVALID_FORMAT';
        }
    }

    async sendPasswordResetCode(phoneNumber, code) {
        try {
            // Ensure code is a string and clean it
            const cleanCode = String(code || '').replace(/\D/g, '');
            
            // Log the received code for debugging
            logger.info('Received verification code:', {
                originalCode: code,
                cleanCode,
                length: cleanCode.length
            });

            // Validate code format
            if (!cleanCode || cleanCode.length !== 6) {
                logger.warn('Invalid verification code:', { 
                    originalCode: code,
                    cleanCode,
                    length: cleanCode?.length 
                });
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST, 
                    'Invalid verification code format. Expected 6 digits.'
                );
            }

            // Log the verification code in development
            logger.info('🔑 Development: Verification Code:', {
                code: cleanCode,
                phoneNumber: this.maskPhoneNumber(phoneNumber),
                expiresIn: '1 minute'
            });

            const message = `Your Pregnify verification code is: ${cleanCode}\n\nThis code will expire in 1 minute. Do not share this code with anyone.`;
            
            // Mock SMS sending
            await this.sendSMS(phoneNumber, message, { 
                priority: 'high',
                validityPeriod: 60
            });

            // Return success response
            return {
                success: true,
                message: 'Verification code sent successfully (Development Mode)',
                data: {
                    phoneNumber: this.maskPhoneNumber(phoneNumber),
                    codeLength: cleanCode.length,
                    expiresIn: '1 minute'
                }
            };
        } catch (error) {
            logger.error('Failed to send verification code:', {
                error: error.message,
                phoneNumber: this.maskPhoneNumber(phoneNumber)
            });
            throw error;
        }
    }

    async sendLoginNotification(phoneNumber, deviceInfo) {
        if (!deviceInfo?.device || !deviceInfo?.location) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid device information');
        }

        logger.info('🔔 Development: Login Notification:', { deviceInfo });

        const message = `Security Alert: New login detected\n\nDevice: ${deviceInfo.device}\nLocation: ${deviceInfo.location}\nTime: ${new Date().toLocaleString()}`;
        
        await this.sendSMS(phoneNumber, message, { priority: 'high' });
        return { success: true, message: 'Login notification sent (Development Mode)' };
    }

    async sendSecurityAlert(phoneNumber, message) {
        if (!message) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Alert message is required');
        }

        logger.info('⚠️ Development: Security Alert:', { message });

        await this.sendSMS(phoneNumber, message, { 
            priority: 'high',
            validityPeriod: 300
        });
        return { success: true, message: 'Security alert sent (Development Mode)' };
    }
}

export const smsService = new SMSService();
