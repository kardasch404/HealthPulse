import Joi from 'joi';
import { ValidationError } from '../utils/errors.js';

class UserValidator {
    /**
     * Validate user creation data
     */
    static validateCreateUser(data) {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .required()
                .lowercase()
                .trim()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'any.required': 'Email is required'
                }),
            
            password: Joi.string()
                .min(6)
                .required()
                .messages({
                    'string.min': 'Password must be at least 6 characters',
                    'any.required': 'Password is required'
                }),
            
            fname: Joi.string()
                .required()
                .trim()
                .min(2)
                .max(50)
                .messages({
                    'string.min': 'First name must be at least 2 characters',
                    'string.max': 'First name must not exceed 50 characters',
                    'any.required': 'First name is required'
                }),
            
            lname: Joi.string()
                .required()
                .trim()
                .min(2)
                .max(50)
                .messages({
                    'string.min': 'Last name must be at least 2 characters',
                    'string.max': 'Last name must not exceed 50 characters',
                    'any.required': 'Last name is required'
                }),
            
            phone: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .optional()
                .messages({
                    'string.pattern.base': 'Phone number must be 10 digits'
                }),
            
            roleId: Joi.string()
                .required()
                .messages({
                    'any.required': 'Role ID is required'
                }),
            
            pharmacyId: Joi.string()
                .optional()
                .messages({
                    'string.base': 'Pharmacy ID must be a string'
                }),
            
            laboratoryId: Joi.string()
                .optional()
                .messages({
                    'string.base': 'Laboratory ID must be a string'
                })
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            throw new ValidationError('Validation failed', errors);
        }

        return value;
    }

    /**
     * Validate user update data
     */
    static validateUpdateUser(data) {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .lowercase()
                .trim()
                .messages({
                    'string.email': 'Please provide a valid email address'
                }),
            
            fname: Joi.string()
                .trim()
                .min(2)
                .max(50)
                .messages({
                    'string.min': 'First name must be at least 2 characters',
                    'string.max': 'First name must not exceed 50 characters'
                }),
            
            lname: Joi.string()
                .trim()
                .min(2)
                .max(50)
                .messages({
                    'string.min': 'Last name must be at least 2 characters',
                    'string.max': 'Last name must not exceed 50 characters'
                }),
            
            phone: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .messages({
                    'string.pattern.base': 'Phone number must be 10 digits'
                }),
            
            isActive: Joi.boolean()
        }).min(1); // At least one field must be provided

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            throw new ValidationError('Validation failed', errors);
        }

        return value;
    }
}

export default UserValidator;
