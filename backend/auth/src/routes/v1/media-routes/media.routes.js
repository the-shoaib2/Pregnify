import express from 'express';
import { isAuthenticated, optionalAuth } from '../../../middlewares/auth/auth.middleware.js';
import { uploadLimiter } from '../../../middlewares/rate-limit/rate.limiter.js';
import { validateImageUpload } from '../../../validators/media.validator.js';
import * as mediaController from '../../../controllers/media/media.controller.js';
import * as uploadController from '../../../controllers/media/upload.controller.js';
import { validateRequest } from '../../../middlewares/validation/validate.middleware.js';
import { handleFileUpload, handleMultipleFileUpload } from '../../../middlewares/multer/upload.middleware.js';

const router = express.Router();

// Public Routes with optional authentication
router.get('/files', optionalAuth, mediaController.getFiles);
router.get('/files/:fileId', optionalAuth, mediaController.getFileById);
router.get('/files/category/:category', optionalAuth, mediaController.getFilesByCategory);
router.get('/files/type/:fileType', optionalAuth, mediaController.getFilesByType);
router.get('/stream/:fileId', mediaController.streamMedia);
router.get('/download/:fileId', mediaController.downloadFile);

// Protected Routes - require authentication
router.use(isAuthenticated);

// File upload routes
router.post(
    '/upload/image',
    uploadLimiter,
    handleFileUpload,
    validateImageUpload,
    validateRequest,
    uploadController.uploadFile
);


router.post(
    '/upload/images/batch',
    uploadLimiter,
    handleMultipleFileUpload,
    uploadController.uploadFiles
);

router.post(
    '/upload/file',
    uploadLimiter,
    handleFileUpload,
    validateImageUpload,
    validateRequest,
    uploadController.uploadFile
);

router.post(
    '/upload/files/batch',
    uploadLimiter,
    handleMultipleFileUpload,
    uploadController.uploadFiles
);

router.post(
    '/upload/audio',
    uploadLimiter,
    handleFileUpload,
    validateImageUpload,
    validateRequest,
    uploadController.uploadFile
);

router.post(
    '/upload/audios/batch',
    uploadLimiter,
    handleMultipleFileUpload,
    uploadController.uploadFiles
);

// File upload confirmation routes
router.post('/upload/confirm/:fileId', uploadController.confirmUpload);
router.post('/upload/cancel/:fileId', uploadController.cancelUpload);

// File management routes
router.get('/files', mediaController.getFiles);
router.get('/files/:fileId', mediaController.getFileById);
router.put('/files/:fileId', validateImageUpload, validateRequest, mediaController.updateFile);
router.delete('/files/:fileId', mediaController.deleteFile);
router.put('/files/:fileId/privacy', validateImageUpload, validateRequest, mediaController.updateFilePrivacy);

// File interaction routes
router.post('/files/react/:fileId', mediaController.reactFile);
router.post('/files/comment/:fileId', mediaController.commentOnFile);
router.post('/files/share/:fileId', mediaController.shareFile);

// File optimization routes
router.post('/files/optimize', handleFileUpload, mediaController.optimizeFile);
router.post('/files/resize', handleFileUpload, mediaController.resizeImage);

// File streaming and download
router.get('/stream/:fileId', mediaController.streamMedia);
router.get('/download/:fileId', mediaController.downloadFile);

export default router;