import { ValidationError } from '../utils/errors.js';

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            
            throw new ValidationError(errorMessage);
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};
