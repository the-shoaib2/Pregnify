// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Base folder for media files
export const BASE_FOLDER = process.env.APP_NAME || 'APP';

// Allowed file types
export const ALLOWED_FILE_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/jpg',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'image/hevc',
    'image/heif-sequence',
    'image/heic-sequence',
    'image/hevc-sequence',
    
    
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/tab-separated-values',
    'text/calendar',
    'text/richtext',
    'text/webviewhtml',
    'text/x-web-markdown',
    'text/x-web-markdown-strict',
    'text/x-web-markdown-extra',
    'text/x-web-markdown-github',
    'text/x-web-markdown-mmd',
    'text/x-web-markdown-strikethrough',
    'text/x-web-markdown-tasklist',
    'text/x-web-markdown-toc',
    'application/zip',
    'application/x-rar-compressed',
    
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/m4a',
    'audio/aac',
    'audio/flac',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/m4a',
    'audio/aac',
    'audio/flac',


    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/flv',
    'video/wmv',
    'video/mpg',
];

// Image processing defaults
export const IMAGE_DEFAULTS = {
    maxWidth: 4096,
    maxHeight: 4096,
    defaultQuality: 80,
    defaultFormat: 'jpeg',
    supportedFormats: ['jpeg', 'png', 'webp', 'avif' , 'gif', 'heic']
};

// File upload limits
export const UPLOAD_LIMITS = {
    maxFiles: 10,           // Maximum files per request
    maxTotalSize: 50 * 1024 * 1024,  // 50MB total
    maxConcurrentUploads: 3
};

// Media constants
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'image/hevc',
    'image/heif-sequence',
    'image/heic-sequence',
    'image/hevc-sequence',
];

export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/flv',
    'video/wmv',
    'video/mpg',
];

export const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/m4a',
    'audio/aac',
    'audio/flac',
];

export const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/tab-separated-values',
    'text/calendar',
    'text/richtext',
    'text/webviewhtml',
    'text/x-web-markdown',
    'text/x-web-markdown-strict',
    'text/x-web-markdown-extra',
    'text/x-web-markdown-github',
    'text/x-web-markdown-mmd',
    'text/x-web-markdown-strikethrough',
    'text/x-web-markdown-tasklist',
    'text/x-web-markdown-toc',
    'application/zip',
    'application/x-rar-compressed',
];

export const ALLOWED_OTHER_TYPES = [
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES
];

export const FILE_SIZE_LIMITS = {
    IMAGE: 10 * 1024 * 1024,      // 10MB
    VIDEO: 100 * 1024 * 1024,     // 100MB
    AUDIO: 50 * 1024 * 1024,      // 50MB
    DOCUMENT: 25 * 1024 * 1024,   // 25MB
    DEFAULT: 10 * 1024 * 1024     // 10MB
};

export const IMAGE_QUALITY = {
    HIGH: 90,
    MEDIUM: 80,
    LOW: 50
};

export const IMAGE_SIZES = {
    THUMBNAIL: { width: 80, height: 80 },
    SMALL: { width: 200, height: 200 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1000, height: 1000 }
};

export const THUMBNAIL_SIZES = {
    AVATAR: {
        THUMB: { width: 150, height: 150 },
        SMALL: { width: 300, height: 300 },
        MEDIUM: { width: 600, height: 600 }
    },
    COVER: {
        THUMB: { width: 300, height: 100 },
        SMALL: { width: 900, height: 300 },
        MEDIUM: { width: 1200, height: 400 }
    }
};

export const CLOUDINARY_TRANSFORMATIONS = {
    IMAGE: {
        thumbnail: 'c_thumb,w_200,h_200',
        small: 'c_scale,w_400',
        medium: 'c_scale,w_800',
        large: 'c_scale,w_1200'
    },
    VIDEO: {
        thumbnail: 'c_thumb,w_200,h_200',
        small: 'c_scale,w_480',
        medium: 'c_scale,w_720',
        large: 'c_scale,w_1080'
    }
    // Add other file type transformations as needed
};

export const CLOUDINARY_FOLDERS = {
    BASE: process.env.CLOUDINARY_BASE_FOLDER || 'APP',
    TYPE: {
        PROFILE: 'profile',
        COVER: 'cover',
        POST: 'post',
        STORY: 'story',
        GALLERY: 'gallery',
        DOCUMENT: 'document',
        OTHER: 'other'
    },
    CATEGORY: {
        IMAGE: 'images',
        VIDEO: 'videos',
        AUDIO: 'audio',
        DOCUMENT: 'documents',
        OTHER: 'other'
    }
};

export const UPLOAD_STATES = {
    TEMPORARY: 'TEMPORARY',
    PERMANENT: 'PERMANENT',
    DELETED: 'DELETED'
};

export const TEMP_FILE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const IMAGE_OPTIMIZATION = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MIN_SIZE: 30 * 1024, // 30KB
    SKIP_SIZE: 150 * 1024, // 150KB - Skip processing for small images
    MAX_DIMENSION: 2048, // Maximum dimension for any side
    QUALITY: {
        HIGH: 90,
        MEDIUM: 80,
        LOW: 70,
        THUMBNAIL: 60
    },
    FORMATS: {
        JPEG: 'jpeg',
        WEBP: 'webp',
        AVIF: 'avif'
    },
    TRANSFORMATIONS: {
        PROFILE: {
            sizes: [
                { width: 400, height: 400, quality: 90 },
                { width: 200, height: 200, quality: 80 },
                { width: 100, height: 100, quality: 70 }
            ]
        },
        COVER: {
            sizes: [
                { width: 1200, height: 400, quality: 90 },
                { width: 800, height: 267, quality: 80 }
            ]
        },
        GALLERY: {
            sizes: [
                { width: 1920, quality: 90 },
                { width: 1280, quality: 80 },
                { width: 640, quality: 70 }
            ]
        }
    }
};

export default {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    IMAGE_DEFAULTS,
    UPLOAD_LIMITS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_AUDIO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_OTHER_TYPES,
    FILE_SIZE_LIMITS,
    IMAGE_QUALITY,
    IMAGE_SIZES,
    CLOUDINARY_FOLDERS,
    THUMBNAIL_SIZES,
    CLOUDINARY_TRANSFORMATIONS,
    UPLOAD_STATES,
    TEMP_FILE_EXPIRY,
    IMAGE_OPTIMIZATION
}; 