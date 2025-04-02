import { body } from 'express-validator';

export const validatePasskeyRegistration = [
    body('credential')
        .exists()
        .withMessage('Credential is required')
        .isObject()
        .withMessage('Invalid credential format'),
];

export const validatePasskeyAuthentication = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),
    body('credential')
        .exists()
        .withMessage('Credential is required')
        .isObject()
        .withMessage('Invalid credential format'),
]; 