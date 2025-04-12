import { body } from 'express-validator';
import { validateRequest } from '../../../middlewares/validation/validation.middleware.js';
import Joi from 'joi';
import { 
    ALLOWED_IMAGE_TYPES, 
    FILE_SIZE_LIMIT 
} from '../../../constants/index.js';

// Constants for validation
const VALIDATION_CONSTANTS = {
    NAME_MIN: 2,
    NAME_MAX: 50,
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    BIO_MAX: 500,
    DESCRIPTION_MAX: 2000,
    LOCATION_MAX: 100,
    SKILLS_MAX: 20,
    LANGUAGES_MAX: 10,
    FILE_SIZE_MAX: FILE_SIZE_LIMIT,
    SOCIAL_PLATFORMS: ['GITHUB', 'LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM', 'WEBSITE'],
    SKILL_LEVELS: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    LANGUAGE_PROFICIENCY: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE']
};

// Validation schema for profile update
export const validateProfileUpdate = [
    body('firstName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('lastName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('username')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),

    body('phoneNumber')
        .optional()
        .matches(/^\+[1-9]\d{1,14}$/)
        .withMessage('Phone number must be in E.164 format'),

    body('bio')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),

    body('location')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters'),

    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),

    body('socialLinks')
        .optional()
        .isArray()
        .withMessage('Social links must be an array')
        .custom(links => {
            const validPlatforms = ['GITHUB', 'LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM', 'WEBSITE'];
            return links.every(link => 
                validPlatforms.includes(link.platform) && 
                isValidUrl(link.url)
            );
        })
        .withMessage('Invalid social link format'),

    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array')
        .custom(skills => {
            const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
            return skills.every(skill => 
                skill.name && 
                validLevels.includes(skill.level)
            );
        })
        .withMessage('Invalid skill format'),

    body('languages')
        .optional()
        .isArray()
        .withMessage('Languages must be an array')
        .custom(languages => {
            const validProficiencies = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE'];
            return languages.every(lang => 
                lang.language && 
                validProficiencies.includes(lang.proficiency)
            );
        })
        .withMessage('Invalid language format'),

    validateRequest
];

// Express-validator middleware for profile update
export const validateProfileUpdateMiddleware = [
    body('firstName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
        
    body('lastName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
        
    body('username')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
        
    validateRequest
];

// Avatar update validation
export const validateAvatarUpdate = [
    body('file')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('Avatar image is required');
            }
            
            if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
                throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`);
            }
            
            if (req.file.size > FILE_SIZE_LIMIT) {
                throw new Error(`File size too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`);
            }
            
            return true;
        }),

    validateRequest
];

// Personal information validation
export const validatePersonalInformation = [
    body('firstName')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || (typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 50))
        .withMessage('First name must be between 2 and 50 characters or empty'),

    body('middleName')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || (typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 50))
        .withMessage('Middle name must be between 2 and 50 characters or empty'),

    body('lastName')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || (typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 50))
        .withMessage('Last name must be between 2 and 50 characters or empty'),

    body('nickName')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || (typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 50))
        .withMessage('Nickname must be between 2 and 50 characters or empty'),

    body('genderIdentity')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(value))
        .withMessage('Invalid gender identity'),

    body('dateOfBirth')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || /\d{4}-\d{2}-\d{2}/.test(value))
        .withMessage('Invalid date format or empty'),

        body('contactNumber')
        .optional({ nullable: true })
        .matches(/^\+?\d{5,15}$/)
        .withMessage('Invalid phone number format.'),
      
    

    body('maritalStatus')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'].includes(value))
        .withMessage('Invalid marital status or empty'),


    body('occupation')
        .optional({ nullable: true })
        .custom(occupation => {
            if (!occupation || Object.keys(occupation).length === 0) return true;
            return occupation.title && occupation.company && occupation.experience;
        })
        .withMessage('Occupation must include title, company, and experience or be empty'),

    body('religion')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || typeof value === 'string')
        .withMessage('Religion must be a string or empty'),

    body('hobbies')
        .optional({ nullable: true })
        .custom(value => value === '' || value === null || Array.isArray(value))
        .withMessage('Hobbies must be an array or empty'),

    body('additionalInfo')
        .optional({ nullable: true })
        .custom(additionalInfo => {
            if (!additionalInfo || Object.keys(additionalInfo).length === 0) return true;
            return Array.isArray(additionalInfo.languages) && Array.isArray(additionalInfo.skills);
        })
        .withMessage('Additional info must include languages and skills as arrays or be empty'),

    validateRequest
];


// Education validation
export const validateEducation = [
    body('degree')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Degree must be between 2 and 100 characters'),

    body('fieldOfStudy')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Field of study must be between 2 and 100 characters'),

    body('institution')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Institution must be between 2 and 100 characters'),

    body('startYear')
        .isISO8601()
        .withMessage('Invalid date format'),

    body('endYear')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Invalid date format'),

    body('isOngoing')
        .optional()
        .isBoolean()
        .withMessage('Invalid boolean value'),

    body('gpa')
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 10 })
        .withMessage('GPA must be between 0 and 10'),

    body('qualification')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Qualification must not exceed 200 characters'),

    validateRequest
];

// Basic profile update validation
export const validateProfileUpdateBasic = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: VALIDATION_CONSTANTS.NAME_MIN, max: VALIDATION_CONSTANTS.NAME_MAX })
        .withMessage(`First name must be between ${VALIDATION_CONSTANTS.NAME_MIN} and ${VALIDATION_CONSTANTS.NAME_MAX} characters`),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: VALIDATION_CONSTANTS.NAME_MIN, max: VALIDATION_CONSTANTS.NAME_MAX })
        .withMessage(`Last name must be between ${VALIDATION_CONSTANTS.NAME_MIN} and ${VALIDATION_CONSTANTS.NAME_MAX} characters`),

    body('username')
        .optional()
        .trim()
        .isLength({ min: VALIDATION_CONSTANTS.USERNAME_MIN, max: VALIDATION_CONSTANTS.USERNAME_MAX })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),

    body('phoneNumber')
        .optional()
        .matches(/^\+[1-9]\d{1,14}$/)
        .withMessage('Phone number must be in E.164 format (e.g., +1234567890)'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: VALIDATION_CONSTANTS.BIO_MAX })
        .withMessage(`Bio cannot exceed ${VALIDATION_CONSTANTS.BIO_MAX} characters`),

    body('location')
        .optional()
        .trim()
        .isLength({ max: VALIDATION_CONSTANTS.LOCATION_MAX })
        .withMessage(`Location cannot exceed ${VALIDATION_CONSTANTS.LOCATION_MAX} characters`),

    body('socialLinks')
        .optional()
        .isArray()
        .withMessage('Social links must be an array')
        .custom(links => {
            if (!links.every(link => 
                VALIDATION_CONSTANTS.SOCIAL_PLATFORMS.includes(link.platform) && 
                isValidUrl(link.url)
            )) {
                throw new Error('Invalid social link format');
            }
            return true;
        }),

    body('skills')
        .optional()
        .isArray({ max: VALIDATION_CONSTANTS.SKILLS_MAX })
        .withMessage(`Cannot exceed ${VALIDATION_CONSTANTS.SKILLS_MAX} skills`)
        .custom(skills => {
            if (!skills.every(skill => 
                VALIDATION_CONSTANTS.SKILL_LEVELS.includes(skill.level)
            )) {
                throw new Error('Invalid skill level');
            }
            return true;
        }),

    validateRequest
];

// File upload validation
export const validateFileUpload = [
    body('file')
        .custom((_, { req }) => {
            if (!req.file) {
                throw new Error('File is required');
            }
            if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
                throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`);
            }
            if (req.file.size > FILE_SIZE_LIMIT) {
                throw new Error(`File size too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`);
            }
            return true;
        }),
    validateRequest
];

// Helper function to validate URLs
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export default {
    validateProfileUpdate,
    validateProfileUpdateMiddleware,
    validateAvatarUpdate,
    validatePersonalInformation,
    validateEducation,
    validateProfileUpdateBasic,
    validateFileUpload,
    VALIDATION_CONSTANTS
};
