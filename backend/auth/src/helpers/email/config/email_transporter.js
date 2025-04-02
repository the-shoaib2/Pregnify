import nodemailer from 'nodemailer';

/**
 * @description Creates and verifies an email transporter
 * @returns {Promise<nodemailer.Transporter>} Configured nodemailer transporter
 */
const createTransporter = async () => {
    // For development, use ethereal email if SMTP credentials are not provided
    if (process.env.NODE_ENV !== 'development' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
        const testAccount = await nodemailer.createTestAccount();
        
        const devTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        console.log('Development email credentials:', {
            user: testAccount.user,
            pass: testAccount.pass,
            preview: 'https://ethereal.email'
        });

        return devTransporter;
    }

    // For development, require SMTP credentials
    if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
        throw new Error('Missing SMTP credentials in development environment');
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            pool: true, 
            maxConnections: 5,
            maxMessages: 100, 
            rateDelta: 1000, 
            rateLimit: 5, 
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'development'
            }
        });

        // Verify connection configuration
        await transporter.verify();
        return transporter;
    } catch (error) {
        console.error('Email transporter error:', error.message);
        throw error;
    }
};

// Create and export the transporter
const transporter = await createTransporter();
export default transporter;
