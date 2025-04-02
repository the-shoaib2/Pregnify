import { validationResult } from 'express-validator';
import ApiError from '../../utils/error/api.error.js';
import { HTTP_STATUS } from '../../constants/index.js';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            firstError.msg
        );
    }
    next();
}; 