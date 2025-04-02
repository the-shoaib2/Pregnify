const express = require('express');
const modelController = require('../controllers/modelController');
const { authMiddleware, roles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.isAuthenticate);

// Get all tables
router.get('/tables', modelController.getTables);

// Get table schema
router.get('/schema/:tableName', modelController.getSchema);

// CRUD operations
router.post('/create', modelController.create);
router.get('/read', modelController.read);
router.put('/update', modelController.update);
router.delete('/delete', modelController.delete);

// Bulk operations (Super Admin only)
router.post('/bulk-create',
    authMiddleware.authorize([roles.SUPER_ADMIN]),
    modelController.bulkCreate
);

module.exports = router;
