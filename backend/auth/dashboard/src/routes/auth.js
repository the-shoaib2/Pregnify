const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware, roles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/validate-token', authController.validateToken);

// Protected routes
router.use(authMiddleware.isAuthenticate);

// Admin only routes
router.post('/register', 
    authMiddleware.authorize([roles.SUPER_ADMIN, roles.ADMIN]),
    authController.register
);

// User routes
router.post('/change-password', authController.changePassword);

module.exports = router;
