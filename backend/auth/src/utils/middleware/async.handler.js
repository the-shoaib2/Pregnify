// backend / utils / asyncHandler.js

/**
 * Wraps an async route handler to handle errors consistently
 * @param {Function} fn The async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Error caught by asyncHandler:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        next(error);
    });
};

export default asyncHandler;
