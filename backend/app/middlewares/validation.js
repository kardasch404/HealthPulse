import { ValidationError } from '../utils/errors.js';

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

        req.body = value;
        next();
    };
};
