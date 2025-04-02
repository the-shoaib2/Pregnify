import logger from '../logger/index.js';

// Mock Stripe implementation
const mockStripe = {
    paymentMethods: {
        list: async () => ({ data: [] }),
        create: async () => ({ id: 'pm_mock' }),
        update: async () => ({ updated: true }),
        delete: async () => ({ deleted: true })
    },
    customers: {
        create: async () => ({ id: 'cus_mock' }),
        update: async () => ({ updated: true }),
        retrieve: async () => ({ id: 'cus_mock' })
    },
    subscriptions: {
        create: async () => ({ id: 'sub_mock', status: 'active' }),
        update: async () => ({ updated: true }),
        cancel: async () => ({ canceled: true })
    },
    invoices: {
        list: async () => ({ data: [] }),
        retrieve: async () => ({ id: 'inv_mock' })
    }
};

// Mock helper functions
export const formatAmountForStripe = (amount) => Math.round(amount * 100);
export const formatAmountFromStripe = (amount) => (amount / 100).toFixed(2);

// Mock error handler
export const handleStripeError = (error) => {
    logger.error('Mock Stripe error', { error });
    return {
        message: 'Payment system error (mock)',
        statusCode: 500,
        error: error.message
    };
};

export default {
    stripe: mockStripe,
    testConnection: async () => true,
    formatAmountForStripe,
    formatAmountFromStripe,
    handleStripeError
}; 