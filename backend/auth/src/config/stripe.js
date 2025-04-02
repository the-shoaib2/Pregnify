import Stripe from 'stripe';
import dotenv from 'dotenv';
import logger from '../logger/index.js';

dotenv.config();

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use the latest API version
    typescript: false,
    appInfo: {
        name: 'YourApp',
        version: '1.0.0'
    }
});

// Test the Stripe connection
export const testStripeConnection = async () => {
    try {
        await stripe.paymentMethods.list({ limit: 1 });
        console.log('Successfully connected to Stripe');
        return true;
    } catch (error) {
        console.error('Failed to connect to Stripe:', error.message);
        return false;
    }
};

// Helper function to format amount to cents
export const formatAmountForStripe = (amount, currency = 'usd') => {
    const currencies = ['usd', 'eur', 'gbp']; // Add more as needed
    const multiplier = currencies.includes(currency.toLowerCase()) ? 100 : 1;
    return Math.round(amount * multiplier);
};

// Helper function to format amount from cents
export const formatAmountFromStripe = (amount, currency = 'usd') => {
    const currencies = ['usd', 'eur', 'gbp']; // Add more as needed
    const divider = currencies.includes(currency.toLowerCase()) ? 100 : 1;
    return (amount / divider).toFixed(2);
};

// Helper function to handle Stripe errors
export const handleStripeError = (error) => {
    logger.error('Stripe error', { error });

    let message = 'An error occurred with the payment system';
    let statusCode = 500;

    switch (error.type) {
        case 'StripeCardError':
            message = error.message;
            statusCode = 400;
            break;
        case 'StripeInvalidRequestError':
            message = 'Invalid payment request';
            statusCode = 400;
            break;
        case 'StripeAPIError':
            message = 'Payment system error';
            statusCode = 503;
            break;
        case 'StripeConnectionError':
            message = 'Could not connect to payment system';
            statusCode = 503;
            break;
        case 'StripeAuthenticationError':
            message = 'Payment authentication failed';
            statusCode = 401;
            break;
        case 'StripeRateLimitError':
            message = 'Too many payment requests';
            statusCode = 429;
            break;
        default:
            message = 'Unexpected payment error';
            statusCode = 500;
    }

    return {
        message,
        statusCode,
        error: error.message
    };
}; 